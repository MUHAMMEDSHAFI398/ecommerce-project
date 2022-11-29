const express = require('express');
const body = require('body-parser');
const userRouter = require('../routes/user');
const user = require('../model/userModal');
const bcrypt = require('bcrypt');
const products = require('../model/productModal');
const cart = require('../model/cartModal');
const mongoose = require("mongoose");


const securepassword = async (password) => {
  try {
    const passwordhash = await bcrypt.hash(password, 10)
    return passwordhash
  } catch {
    console.log(error)
  }
}

module.exports = {


  getHome: async (req, res) => {
    let user = req.session.user
    let product = await products.find()
    if (user) {
      customer = true
      res.render('user/index', { customer, product });
    } else {
      customer = false
      res.render('user/index', { customer, product });
    }
  },
  getUserLogin: (req, res) => {
    res.render('user/login')
  },
  getUserSignup: (req, res) => {
    res.render('user/Signup')
  },

  postSignup: async (req, res) => {
    console.log("hello");
    console.log(Error);
    try {
      const spassword = await securepassword(req.body.password)
      const User = new user({
        name: req.body.name,
        email: req.body.email,
        phonenumber: req.body.phonenumber,
        password: spassword
      })
      const userData = await User.save()
      res.redirect('/')
    } catch (error) {
      console.log(error.message)
      res.status(500).send(error)
    }
  },

  postLogin: async (req, res) => {
    const email = req.body.email
    const password = req.body.password
    const userData = await user.findOne({ email: email });
    console.log(userData)


    try {
      if (userData) {
        if (userData.isBlocked === false) {
          const passwordMatch = await bcrypt.compare(password, userData.password)
          if (passwordMatch) {
            req.session.user = req.body.email
            res.redirect('/');
          } else {
            res.render('user/login', { invalid: "invalid username or password" });
          }
        } else {
          res.render('user/login', { userblock: "You are blocked" });
        }
      } else {
        res.render('user/login', { invalid: "invalid username or password" });
      }
    } catch (error) {
      console.log(error)
    }


  },
  userLogout: (req, res) => {
    req.session.destroy();
    res.redirect('/');
  },

  getShopPage: async (req, res) => {
    let user = req.session.user
    let product = await products.find()
    if (user) res.render('user/shop', { product });
    else res.render('user/login');

  },
  getProductViewPage: async (req, res) => {
    let user = req.session.user
    let id=req.params.id
    let product = await products.findOne({_id:id})
    if(user) res.render('user/product_view',{product});
    else res.render('user/login');
  
  },
  // addToCart: async (req,res)=>{
  //   let session = req.session.user
  //   let userDocumet = await user.findOne({email:session})
  //   let proid=req.params.id
  //   res.render('user/cart')
  // },
  addToCart: async (req, res) => {
    const id = req.params.id;
    const objId = mongoose.Types.ObjectId(id);
    const session = req.session.user;
    let proObj = {
      productId: objId,
      quantity: 1,
    };
    const userData = await user.findOne({ email: session });
    const userCart = await cart.findOne({ userId: userData._id });
    if (userCart) {
      let proExist = userCart.product.findIndex(
        (product) => product.productId == id
      );
      if (proExist != -1) {
        await cart.aggregate([
          {
            $unwind: "$product",
          },
        ]);
        await cart.updateOne(
          { userId: userData._id, "product.productId": objId },
          { $inc: { "product.$.quantity": 1 } }
        );
        res.redirect("/");
      } else {
        cart
          .updateOne({ userId: userData._id }, { $push: { product: proObj } })
          .then(() => {
            // res.json({ status: true });
            res.redirect("/");
          });
      }
    } else {
      const newCart = new cart({
        userId: userData._id,
        product: [
          {
            productId: objId,
            quantity: 1,
          },
        ],
      });
      newCart.save().then(() => {
        
        res.redirect("/");
        // res.json({ status: true });
        console.log('hoi')
      });
    }
    
  },
  viewCart: async (req, res) => {
    const session = req.session.user;
    const userData = await user.findOne({ email: session });
    const productData = await cart
      .aggregate([
        {
          $match: { userId: userData.id },
        },
        {
          $unwind: "$product",
        },
        {
          $project: {
            productItem: "$product.productId",
            productQuantity: "$product.quantity",
          },
        },
        {
          $lookup: {
            from: "products",
            localField: "productItem",
            foreignField: "_id",
            as: "productDetail",
          },
        },
        {
          $project: {
            productItem: 1,
            productQuantity: 1,
            productDetail: { $arrayElemAt: ["$productDetail", 0] },
          },
        },
      ])
      .exec();
      count = productData.length;
      console.log(count)
    res.render("user/cart", { productData});
  },
  changeQuantity:async(req,res)=>{
    
    const data = req.body;
    console.log(data)
    const objId = mongoose.Types.ObjectId(data.product);
    await cart
      .aggregate([
        {
          $unwind: "$product",
        },
      ])
      .then((data) => {
        console.log(data);
      });
     await cart.updateOne(
      { _id: data.cart, "product.productId": objId },
      { $inc: { "product.$.quantity": data.count } }
    ).then(()=>{
      res.json({status:true});
    })
    
     
  },
  // removeProduct:async(req,res)=>{
  //   const data = req.body;
  //   const objId = mongoose.Types.ObjectId(data.product);
  //   await cart.aggregate([
  //     {
  //       $unwind:"$product"
  //     }
  //   ])
  //   await cart
  //     .updateOne(
  //       { _id: data.cart, "product.productId": objId },
  //       { $pull: { product: { productId: objId } } }
  //     )
  //     .then(() => {
  //       res.json({status:true});
  //     });
  // },
  getCheckOutPage: async (req,res)=>{
    let session = req.session.user
    let id=req.params.id
    let product = await products.findOne({_id:id})
    if(session) res.render('user/checkout',{product});
    else res.render('user/login');
    
  }

}







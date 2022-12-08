const user = require('../model/userModal');
const bcrypt = require('bcrypt');
const products = require('../model/productModal');
const cart = require('../model/cartModal');
const mongoose = require("mongoose");
const mailer = require("../middlewares/otpValidation");
const order = require('../model/orderModal');
const wishlist = require('../model/whishlist')
const categories = require('../model/categoryModal')
const moment = require("moment");
moment().format();


let name;
let email;
let phonenumber;
let password;
let countInCart;



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
    let session = req.session.user
    let product = await products.find({ delete: false }).populate('category')
    if (session) {
      customer = true
    } else {
      customer = false
    }
    res.render('user/index', { customer, product, countInCart });
  },

  getUserLogin: (req, res) => {
    res.render('user/login')
  },

  getUserSignup: (req, res) => {
    res.render('user/Signup')
  },

  postSignup: async (req, res) => {


    const spassword = await securepassword(req.body.password)
    name = req.body.name,
      email = req.body.email,
      phonenumber = req.body.phonenumber,
      password = spassword

    const mailDetails = {
      from: 'mdshafi1120117@gmail.com',
      to: email,
      subject: "Otp for frutica",
      html: `<p>Your OTP for registering in Fruitkha is ${mailer.OTP}</p>`,
    };


    const User = await user.findOne({ email: email });
    if (User) {
      res.render('user/signup', { err_message: 'User Already Exist' });
    } else {
      mailer.mailTransporter.sendMail(mailDetails, function (err, data) {
        if (err) {

          console.log(err)
        } else {
          console.log("otp redirect");
          res.redirect('/otpPage');
        }
      })
    }
  },

  getOtpPage: (req, res) => {
    res.render('user/otp');
  },
  postOtp: async (req, res) => {
    let otp = req.body.otp;

    if (mailer.OTP === otp) {
      try {

        const User = await user.create({
          name: name,
          email: email,
          phonenumber: phonenumber,
          password: password

        })
      } catch (error) {
        console.log('Error occured');
      }
      res.redirect('/userLogin');

    } else {

      res.render('user/otp', { invalid: 'invalid otp' });
    }
  },

  postLogin: async (req, res) => {
    const email = req.body.email
    const password = req.body.password
    const userData = await user.findOne({ email: email });



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
    let category = await categories.find()
    let product = await products.find({ delete: false }).populate('category')
    res.render('user/shop', { product, countInCart, category });

  },
  getProductViewPage: async (req, res) => {

    let id = req.params.id
    let product = await products.findOne({ _id: id }).populate('category')
    res.render('user/product_view', { product, countInCart });

  },

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
        res.redirect("/viewcart");
      } else {
        cart
          .updateOne({ userId: userData._id }, { $push: { product: proObj } })
          .then(() => {

            res.redirect("/viewcart");

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

        res.redirect("/viewcart");


      });
    }

  },
  // addToWishList: async (req,res)=>{

  //   const id = req.params.id;
  //   const objId = mongoose.Types.ObjectId(id);
  //   const session = req.session.user;

  //   let proObj = {
  //     productId: objId,
  //   };
  //   const userData = await user.findOne({ email: session });
  //   const userId = mongoose.Types.ObjectId(userData._id);
  //   const userWishlist = await wishlist.findOne({ userId: userId });

  //   if (userWishlist) {
  //     let proExist = userWishlist.product.findIndex(
  //       (product) => product.productId == id
  //     );

  // }

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
        {
          $addFields: {
            productPrice: {
              $multiply: ["$productQuantity", "$productDetail.price"]
            }
          }
        }
      ])
      .exec();
    const sum = productData.reduce((accumulator, object) => {
      return accumulator + object.productPrice;
    }, 0);

    countInCart = productData.length;

    res.render("user/cart", { productData, sum, countInCart });


  },
  changeQuantity: async (req, res, next) => {

    const data = req.body;
    const objId = mongoose.Types.ObjectId(data.product);
    cart
      .aggregate([
        {
          $unwind: "$product",
        },
      ])
      .then((data) => {
        console.log(data);
      });
    cart.updateOne(
      { _id: data.cart, "product.productId": objId },
      { $inc: { "product.$.quantity": data.count } }
    ).then(() => {
      next();
    })



  },
  removeProduct: async (req, res) => {
    const data = req.body;
    const objId = mongoose.Types.ObjectId(data.product);
    await cart.aggregate([
      {
        $unwind: "$product"
      }
    ])
    await cart
      .updateOne(
        { _id: data.cart, "product.productId": objId },
        { $pull: { product: { productId: objId } } }
      )
      .then(() => {
        res.json({ status: true });
      });
  },
  totalAmount: async (req, res) => {


    let session = req.session.user;
    const userData = await user.findOne({ email: session });
    const productData = await cart.aggregate([
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
      {
        $addFields: {
          productPrice: {
            $multiply: ["$productQuantity", "$productDetail.price"],
          },
        },
      },
      {
        $group: {
          _id: userData.id,
          total: {
            $sum: { $multiply: ["$productQuantity", "$productDetail.price"] },
          },
        },
      },
    ]).exec();
    res.json({ status: true, productData });
  },

  viewProfile: async (req, res) => {

    const session = req.session.user;
    let userData = await user.findOne({ email: session })
    res.render('user/profile', { userData, countInCart })

  },
  editProfile: async (req, res) => {
    const session = req.session.user;
    let userData = await user.findOne({ email: session })
    res.render('user/editprofile', { userData, countInCart })
  },
  postEditProfile: async (req, res) => {

    const session = req.session.user;
    await user.updateOne(
      { email: session },
      {
        $set: {

          name: req.body.name,
          phonenumber: req.body.phonenumber,
          addressDetails: [
            {
              housename: req.body.housename,
              area: req.body.area,
              landmark: req.body.landmark,
              district: req.body.district,
              state: req.body.state,
              postoffice: req.body.postoffice,
              pin: req.body.pin


            }
          ]

        }
      }
    );

    res.redirect('/viewProfile')
  },
  getCheckOutPage: async (req, res) => {
    let session = req.session.user;
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
        {
          $addFields: {
            productPrice: {
              $multiply: ["$productQuantity", "$productDetail.price"]
            }
          }
        }
      ])
      .exec();
    const sum = productData.reduce((accumulator, object) => {
      return accumulator + object.productPrice;
    }, 0);


    res.render("user/checkout", { productData, sum, countInCart, userData });


  },
  addNewAddress: async (req, res) => {
    const session = req.session.user
    const addObj = {

      housename: req.body.housename,
      area: req.body.area,
      landmark: req.body.landmark,
      district: req.body.district,
      state: req.body.state,
      postoffice: req.body.postoffice,
      pin: req.body.pin

    }
    console.log(addObj)
    await user.updateOne({ email: session }, { $push: { addressDetails: addObj } })
    res.redirect('/checkout')
  },
  placeOrder: async (req, res) => {

    const session = req.session.user;
    const userData = await user.findOne({ email: session })
    const cartData = await cart.findOne({ userId: userData._id });
    const status = req.body.paymentMethod === "COD" ? "placed" : "pending";

    if (cartData) {

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
          {
            $addFields: {
              productPrice: {
                $multiply: ["$productQuantity", "$productDetail.price"]
              }
            }
          }
        ])
        .exec();
      const sum = productData.reduce((accumulator, object) => {
        return accumulator + object.productPrice;
      }, 0);

      const orderData = await order.create({
        userId: userData._id,
        name: userData.name,
        phonenumber: userData.phonenumber,
        address: req.body.address,
        orderItems: cartData.product,
        totalAmount: sum,
        paymentMethod: req.body.paymentMethod,
        orderStatus: status,
        orderDate: moment().format("MMM Do YY"),
        deliveryDate: moment().add(3, "days").format("MMM Do YY"),
      })
      await cart.deleteOne({ userId: userData._id });
      if (req.body.paymentMethod === "COD") {
        res.json({ success: true });
      }

    } else {

      res.redirect("/viewCart");
    }


  },
  orderSuccess: async (req, res) => {

    res.render('user/orderSuccess')
  },
  orderDetails: async (req, res) => {
    const session = req.session.user
    const userData = await user.findOne({ email: session });
    // const productData = await order.aggregate([
    //   {
    //     $match: { userId: userData._id }
    //   },
    //   {
    //     $unwind: "$orderItems",
    //   },
    //   {
    //     $project: {
    //       userId: "$userId",
    //       name: "$name",
    //       address: "$address",
    //       totalAmount: "$totalAmount",
    //       paymentMethod: "$paymentMethod",
    //       paymentStatus: "$paymentStatus",
    //       orderDate: "$orderDate",
    //       deliveryDate: "$delivaryuDate",
    //       productItem: "$orderItems.productId",
    //       productQuantity: "$orderItems.quantity"
    //     }
    //   },
    //   {
    //     $lookup: {
    //       from: "productdetails",
    //       localField: "productItem",
    //       foreignField: "_id",
    //       as: "productDetail",
    //     }
    //   },
    //   {
    //     $project: {

    //       userId: 1,
    //       name: 1,
    //       phonenumber: 1,
    //       address: 1,
    //       totalAmount: 1,
    //       paymentMethod: 1,
    //       paymentStatus: 1,
    //       orderDate: 1,
    //       deliveryDate: 1,
    //       productItem: 1,
    //       productQuantity: 1,
    //       productDetail: { $arrayElemAt: ["$productDetail", 0] }

    //     }
    //   },
    //   {
    //     $addFields: {
    //       productPrice: {
    //         $multiply: ["$productQuantity", "$productDetail.price"],
    //       }
    //     }
    //   }
    // ]);
    order.find({ userId: userData._id }).then((orderDetails) => {
      res.render('user/orderDetails', { orderDetails, countInCart })
    })



  },
  orderedProduct: async (req, res) => {
    const id = req.params.id;
    const objId = mongoose.Types.ObjectId(id);
    const productData = await order.aggregate([
      {
        $match: { _id: objId },
      },
      {
        $unwind: "$orderItems",
      },
      {
        $project: {
          productItem: "$orderItems.productId",
          productQuantity: "$orderItems.quantity",
        }
      },
      {
        $lookup: {
          from: "products",
          localField: "productItem",
          foreignField: "_id",
          as: "productDetail",
        }
      },

      {
        $project: {
          productItem: 1,
          productQuantity: 1,
          productDetail: { $arrayElemAt: ["$productDetail", 0] },
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'productDetail.category',
          foreignField: "_id",
          as: "category_name"
        }
      },
      {
        $unwind: "$category_name"
      },

    ]);

    res.render('user/orderedProduct', { productData, countInCart })

  },

  cancelOrder: async (req, res) => {
    const data = req.params.id;
    await order.updateOne({ _id: data }, { $set: { orderStatus: "cancelled" } })
    res.redirect("/orderDetails");

  },

  getCategoryWisePage: async (req, res) => {

    const id = req.params.id
    const category = await categories.find();
    const product = await products.find({ category: id, delete: false }).populate('category')
    console.log(product);
    res.render('user/shop', { product, countInCart, category })

  }


}








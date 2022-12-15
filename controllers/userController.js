const user = require('../model/userModal');
const bcrypt = require('bcrypt');
const products = require('../model/productModal');
const cart = require('../model/cartModal');
const mongoose = require("mongoose");
const mailer = require("../middlewares/otpValidation");
const order = require('../model/orderModal');
const wishlist = require('../model/whishlist')
const categories = require('../model/categoryModal')
const crypto = require("crypto");
const coupon = require('../model/coupen');
const otp = require('../model/otp')
const instance = require("../middlewares/razorpay");
const moment = require("moment");
moment().format();




let countInCart;
let countInWishlist;


const securepassword = async (password) => {
  try {
    const passwordhash = await bcrypt.hash(password, 10)
    return passwordhash
  } catch {
    console.log(error)
  }
}
function checkCoupon(data, id) {

  return new Promise((resolve) => {
    if (data.coupon) {
      coupon
        .find(
          { couponName: data.coupon },
          { users: { $elemMatch: { userId: id } } }
        )
        .then((exist) => {
          console.log("exist" + exist);
          if (exist[0].users.length) {
            resolve(true);
            console.log("exist" + exist[0].users.length)
          } else {
            coupon.find({ couponName: data.coupon }).then((discount) => {
              resolve(discount);
            });
          }
        });
    } else {
      resolve(false);
    }
  });
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
    res.render('user/index', { customer, product, countInCart, countInWishlist });
  },

  getUserLogin: (req, res) => {
    res.render('user/login')
  },

  getUserSignup: (req, res) => {
    res.render('user/Signup')
  },

  postSignup: async (req, res) => {

    
    const spassword = await securepassword(req.body.password)
    const name = req.body.name
    const email = req.body.email
    const phonenumber  = req.body.phonenumber
    const password  = spassword
     
    
    const  OTP = `${Math.floor(1000 + Math.random() * 9000)}`
    const mailDetails = {
      from: 'mdshafi1120117@gmail.com',
      to: email,
      subject: "Otp for frutica",
      html: `<p>Your OTP for registering in Fruitkha is ${OTP}</p>`,
    };


    const User = await user.findOne({ email: email });
    if (User) {
      res.render('user/signup', { err_message: 'User Already Exist' });
    } else {
     
        const User = {
          name: name,
          email: email,
          phonenumber: phonenumber,
          password: password

        }
     
      mailer.mailTransporter.sendMail(mailDetails, function (err, data) {
        if (err) {

          console.log(err)
        } else {
          otp.create({
            email: email,
            otp: OTP
        }).then((otpActive)=>{
          
          res.redirect(`/otpPage?name=${User.name}&email=${User.email}&phonenumber=${User.phonenumber}&password=${User.password}`);

        })
          
        }
      })
    }
  },

  getOtpPage: async (req, res) => {
 
    let userData= req.query
    // console.log(req.query)
    // const userData = await user.findOne({email:email})
    res.render('user/otp', {userData});

  },
  postOtp: async (req, res) => {
    const body=req.body
    console.log(req.body)
    
    const sentOtp  =await otp.findOne({
      email:body.email
    })
    console.log(sentOtp)
    if (req.body.otp  == sentOtp.otp ) {

      res.redirect('/userLogin');
      const User = await user.create({
        name: body.name,
        email: body.email,
        phonenumber: body.phonenumber,
        password: body.password

      })
      
    } else {

      res.render('user/otp', { invalid: 'invalid otp',userData });
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
    res.render('user/shop', { product, countInCart, category, countInWishlist });

  },
  getCategoryWisePage: async (req, res) => {

    const id = req.params.id
    const category = await categories.find();
    const product = await products.find({ category: id, delete: false }).populate('category')
    res.render('user/shop', { product, countInCart, category, countInWishlist })

  },
  getProductViewPage: async (req, res) => {

    let id = req.params.id
    let product = await products.findOne({ _id: id }).populate('category')
    res.render('user/product_view', { product, countInCart, countInWishlist });

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
        res.end()


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


    res.render("user/cart", { productData, sum, countInCart, countInWishlist });


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
  addToWishlist: async (req, res) => {

    const id = req.params.id;
    const objId = mongoose.Types.ObjectId(id);
    const session = req.session.user;

    let proObj = {
      productId: objId,
    };
    const userData = await user.findOne({ email: session });
    const userWishlist = await wishlist.findOne({ userId: userData._id });
    console.log(userData);
    console.log(userWishlist);

    if (userWishlist) {

      let proExist = userWishlist.product.findIndex(
        (product) => product.productId == id
      );
      if (proExist != -1) {

        res.redirect('/viewWishlist')
      } else {

        wishlist.updateOne(
          { userId: userData._id }, { $push: { product: proObj } }
        ).then(() => {
          res.redirect('/viewWishlist')
        });
      }
    } else {
      const newWishlist = new wishlist({
        userId: userData._id,
        product: [
          {
            productId: objId,

          },
        ],
      });
      newWishlist.save().then(() => {
        res.redirect('/viewWishlist')
      });
    }

  },
  viewWishlist: async (req, res) => {

    const session = req.session.user;
    const userData = await user.findOne({ email: session })
    const userId = mongoose.Types.ObjectId(userData._id);;

    const wishlistData = await wishlist
      .aggregate([
        {
          $match: { userId: userId }
        },
        {
          $unwind: "$product",
        },
        {
          $project: {
            productItem: "$product.productId",

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
            productDetail: { $arrayElemAt: ["$productDetail", 0] }
          }
        }

      ])
    countInWishlist = wishlistData.length
    res.render('user/wishlist', { wishlistData, countInWishlist, countInCart })

  },
  removeFromWishlist: async (req, res) => {
    const data = req.body;
    const objId = mongoose.Types.ObjectId(data.productId);
    await wishlist.aggregate([
      {
        $unwind: "$product",
      },
    ]);
    await wishlist
      .updateOne(
        { _id: data.wishlistId, "product.productId": objId },
        { $pull: { product: { productId: objId } } }
      )
      .then(() => {
        res.json({ status: true });
      });
  },


  changeQuantity: async (req, res, next) => {

    const data = req.body;
    data.count = parseInt(data.count);
    data.quantity = parseInt(data.quantity);
    const objId = mongoose.Types.ObjectId(data.product);

    if (data.count == -1 && data.quantity == 1) {
      res.json({ quantity: true })
    } else {
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

    }



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
    res.render('user/profile', { userData, countInCart, countInWishlist })

  },
  editProfile: async (req, res) => {
    const session = req.session.user;
    let userData = await user.findOne({ email: session })
    res.render('user/editprofile', { userData, countInCart, countInWishlist })
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
    const userId = userData._id.toString()

    const productData = await cart
      .aggregate([
        {
          $match: { userId: userId },
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


    res.render("user/checkout", { productData, sum, countInCart, countInWishlist, userData });


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

    await user.updateOne({ email: session }, { $push: { addressDetails: addObj } })
    res.redirect('/checkout')
  },
  placeOrder: async (req, res) => {

    const data = req.body
    const session = req.session.user;
    const userData = await user.findOne({ email: session })
    const objId = mongoose.Types.ObjectId(userData._id);
    
    const cartData = await cart.findOne({ userId: userData._id });
     
    if(data.coupon){
      invalid = await coupon.findOne({ couponName: data.coupon });
   }else{
     invalid = 0;
   } 
   if (invalid == null) {
   
    res.json({ invalid: true });
  }else{
    const discount = await checkCoupon(data, objId);
    console.log(discount);
    if (discount == true) {  
      res.json({ coupon: true });
    } else {
     
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
        if (discount == false) {
          var total = sum;
        } else {
          var dis = sum * discount[0].discount;
          if (dis > discount[0].maxLimit) {
            total = sum - 100;
          } else {
            total = dis;
          }
        }

        const orderData = await order.create({

          userId: userData._id,
          name: userData.name,
          phonenumber: userData.phonenumber,
          address: req.body.address,
          orderItems: cartData.product,
          totalAmount: total,
          paymentMethod: req.body.paymentMethod,
          orderDate: moment().format("MMM Do YY"),
          deliveryDate: moment().add(3, "days").format("MMM Do YY")

        })
        const amount = orderData.totalAmount * 100
        const orderId = orderData._id
        await cart.deleteOne({ userId: userData._id });

        if (req.body.paymentMethod === "COD") {

          res.json({ success: true });
          coupon.updateOne(
            { couponName: data.coupon },
            { $push: { users: { userId: objId } } }
          ).then((updated) => {
            console.log(updated);
          });
            

        } else {
          let options = {
            amount: amount,
            currency: "INR",
            receipt: "" + orderId,
          };
          instance.orders.create(options, function (err, order) {

            if (err) {
              console.log(err);
            } else {
              res.json(order);

              coupon.updateOne(
                { couponName: data.coupon },
                { $push: { users: { userId: objId } } }
              ).then((updated) => {
                console.log(updated);
              });
            }
          })

        }

      } else {

        res.redirect("/viewCart");
      }
    }

  } 
    

  },
  verifyPayment: async (req, res) => {

    const details = req.body;
    let hmac = crypto.createHmac("sha256", process.env.KETSECRET);
    hmac.update(details.payment.razorpay_order_id + "|" + details.payment.razorpay_payment_id);
    hmac = hmac.digest("hex");

    if (hmac == details.payment.razorpay_signature) {

      const objId = mongoose.Types.ObjectId(details.order.receipt);
      order.updateOne({ _id: objId }, { $set: { paymentStatus: "paid" } }).then(() => {

        res.json({ success: true });

      }).catch((err) => {
        console.log(err);
        res.json({ status: false, err_message: "payment failed" });
      })

    } else {
      console.log(err);
      res.json({ status: false, err_message: "payment failed" });
    }
  },
  orderSuccess: async (req, res) => {

    const countInCart = 0
    res.render('user/orderSuccess', { countInCart, countInWishlist })
  },
  paymentFail: (req, res) => {

    res.render("user/paymentFail", { countInWishlist, countInCart });
  },

  orderDetails: async (req, res) => {

    const session = req.session.user
    const userData = await user.findOne({ email: session });
    order.find({ userId: userData._id }).sort({ createdAt: -1 }).then((orderDetails) => {
      res.render('user/orderDetails', { orderDetails, countInCart, countInWishlist })
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
          address: 1,
          name: 1,
          phonenumber: 1
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
          name: 1,
          phonenumber: 1,
          address: 1,
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


    res.render('user/orderedProduct', { productData, countInCart, countInWishlist })

  },

  cancelOrder: async (req, res) => {
    const data = req.params.id;
    await order.updateOne({ _id: data }, { $set: { orderStatus: "cancelled" } })
    res.redirect("/orderDetails");

  },




}








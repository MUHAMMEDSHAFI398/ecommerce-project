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
const banner = require('../model/banner')
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
    console.error()
    res.render('user/500')
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
         
          console.log(exist);
          if (exist[0].users.length) {
            resolve(true);

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
    try {
      let session = req.session.user
      let product = await products.find({ delete: false }).populate('category')
      if (session) {
        customer = true
      } else {
        customer = false
      }
      const bannerData =await banner.find().sort({createdAt:-1}).limit(1)
      res.render('user/index', { customer, product, countInCart, countInWishlist,bannerData });

    } catch {
      console.error()
      res.render('user/500')
    }

  },

  getUserLogin: (req, res) => {
    res.render('user/login')
  },

  getUserSignup: (req, res) => {
    res.render('user/Signup')
  },

  postSignup: async (req, res) => {

    try {
      const spassword = await securepassword(req.body.password)
      const name = req.body.name
      const email = req.body.email
      const phonenumber = req.body.phonenumber
      const password = spassword


      const OTP = `${Math.floor(1000 + Math.random() * 9000)}`
      const mailDetails = {
        from: process.env.nodemailer_email,
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
            }).then((otpActive) => {

              res.redirect(`/otpPage?name=${User.name}&email=${User.email}&phonenumber=${User.phonenumber}&password=${User.password}`);

            })

          }
        })
      }
    } catch {
      console.error()
      res.render('user/500')
    }

  },

  getOtpPage: (req, res) => {

    let userData = req.query
    res.render('user/otp', { userData });

  },
  postOtp: async (req, res) => {
    try {
      const body = req.body
      console.log(req.body)

      const sentOtp = await otp.findOne({
        email: body.email
      })
      console.log(sentOtp)
      if (req.body.otp == sentOtp.otp) {

        res.redirect('/userLogin');
        const User = await user.create({
          name: body.name,
          email: body.email,
          phonenumber: body.phonenumber,
          password: body.password

        })

      } else {

        res.render('user/otp', { invalid: 'invalid otp', userData });
      }

    } catch {
      console.error()
      res.render('user/500')
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
      console.error()
      res.render('user/500')
    }


  },
  userLogout: (req, res) => {
    req.session.destroy();
    res.redirect('/');
  },

  getShopPage: async (req, res) => {

    try {
      let category = await categories.find()
      let product = await products.find({ delete: false }).populate('category')
      res.render('user/shop', { product, countInCart, category, countInWishlist });

    } catch {
      console.error()
      res.render('user/500')
    }


  },
  getCategoryWisePage: async (req, res) => {

    try {
      const id = req.params.id
      const category = await categories.find();
      const product = await products.find({ category: id, delete: false }).populate('category')
      res.render('user/shop', { product, countInCart, category, countInWishlist })

    } catch {

      console.error()
      res.render('user/500')

    }


  },
  getProductViewPage: async (req, res) => {

    try {
      let id = req.params.id
      let product = await products.findOne({ _id: id }).populate('category')
      res.render('user/product_view', { product, countInCart, countInWishlist });

    } catch {
      console.error()
      res.render('user/500')
    }


  },

  addToCart: async (req, res) => {
    try {
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

          res.json({ productExist: true })

        } else {
          cart
            .updateOne({ userId: userData._id }, { $push: { product: proObj } })
            .then(() => {
              res.json({ status: true })

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
          res.json({ status: true })


        });
      }

    } catch {
      console.error()
      res.render('user/500')
    }


  },
  viewCart: async (req, res) => {

    try {
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

    } catch {
      console.error()
      res.render('user/500')
    }



  },
  removeProduct: async (req, res) => {
    try {
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

    } catch {
      console.error()
      res.render('user/500')
    }

  },
  addToWishlist: async (req, res) => {

    try {
      const id = req.params.id;
      const objId = mongoose.Types.ObjectId(id);
      const session = req.session.user;

      let proObj = {
        productId: objId,
      };
      const userData = await user.findOne({ email: session });
      const userWishlist = await wishlist.findOne({ userId: userData._id });


      if (userWishlist) {

        let proExist = userWishlist.product.findIndex(
          (product) => product.productId == id
        );
        if (proExist != -1) {

          res.json({ productExist: true });
        } else {

          wishlist.updateOne(
            { userId: userData._id }, { $push: { product: proObj } }
          ).then(() => {
            res.json({ status: true });
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
          res.json({ status: true });
        });
      }
    } catch {
      console.error()
      res.render('user/500')
    }



  },
  viewWishlist: async (req, res) => {

    try {
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

    } catch {
      console.error()
      res.render('user/500')

    }



  },
  removeFromWishlist: async (req, res) => {
    try {
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

    } catch {

      console.error()
      res.render('user/500')

    }

  },


  changeQuantity: async (req, res, next) => {

    try {
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


    } catch {
      console.error()
      res.render('user/500')
    }




  },

  totalAmount: async (req, res) => {

    try {
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

    } catch {
      console.error()
      res.render('user/500')
    }


  },

  viewProfile: async (req, res) => {
    try {
      const session = req.session.user;
      let userData = await user.findOne({ email: session })
      res.render('user/profile', { userData, countInCart, countInWishlist })

    } catch {
      console.error()
      res.render('user/500')
    }


  },
  editProfile: async (req, res) => {
    try {
      const session = req.session.user;
      let userData = await user.findOne({ email: session })
      res.render('user/editprofile', { userData, countInCart, countInWishlist })

    } catch {
      console.error()
      res.render('user/500')
    }

  },
  postEditProfile: async (req, res) => {
    try {
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
    } catch {
      console.error()
      res.render('user/500')
    }

  },
  getCheckOutPage: async (req, res) => {

    try {
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

    } catch {
      console.error()
      res.render('user/500')
    }

  },


  addNewAddress: async (req, res) => {

    try {
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

    } catch {
      console.error()
      res.render('user/500')

    }

  },
  placeOrder: async (req, res) => {

    try {
      let invalid;
      let couponDeleted;
      const data = req.body
      const session = req.session.user;
      const userData = await user.findOne({ email: session })
      const objId = mongoose.Types.ObjectId(userData._id);
      const cartData = await cart.findOne({ userId: userData._id });

      if (data.coupon) {
        invalid = await coupon.findOne({ couponName: data.coupon });
        if (invalid?.delete == true) {
          couponDeleted = true
        }
      } else {
        invalid = 0;
      }



      if (invalid == null) {

        res.json({ invalid: true });

      } else if (couponDeleted) {

        res.json({ couponDeleted: true })
      }
      else {

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
            await order.updateOne({_id:orderId},{$set:{orderStatus:'placed'}})  
  
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


    } catch {
      console.log(error)
      res.render('user/500')
    }


  },
  verifyPayment: async (req, res) => {

    const details = req.body;
    let hmac = crypto.createHmac("sha256", process.env.KETSECRET);
    hmac.update(details.payment.razorpay_order_id + "|" + details.payment.razorpay_payment_id);
    hmac = hmac.digest("hex");

    if (hmac == details.payment.razorpay_signature) {

      const objId = mongoose.Types.ObjectId(details.order.receipt);
      order.updateOne({ _id: objId }, { $set: { paymentStatus: "paid",orderStatus:'placed' } }).then(() => {

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
  orderSuccess: (req, res) => {

    const countInCart = 0
    res.render('user/orderSuccess', { countInCart, countInWishlist })
  },
  paymentFail: (req, res) => {
   
    res.render("user/paymentFail", { countInWishlist, countInCart });
  },

  orderDetails: async (req, res) => {

    try {

      const session = req.session.user
      const userData = await user.findOne({ email: session });
      order.find({ userId: userData._id }).sort({ createdAt: -1 }).then((orderDetails) => {
        res.render('user/orderDetails', { orderDetails, countInCart, countInWishlist })
      })

    } catch {
      console.error()
      res.render('user/500')
    }

  },
  orderedProduct: async (req, res) => {

    try {
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

    } catch {
      console.error()
      res.render('user/500')
    }


  },

  cancelOrder: async (req, res) => {
    try {
      const data = req.params.id;
      await order.updateOne({ _id: data }, { $set: { orderStatus: "cancelled" } })
      res.redirect("/orderDetails");

    } catch {
      console.error()
      res.render('user/500')
    }


  },


}








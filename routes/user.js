const express = require('express');
const userRouter = express();
const userController = require('../controllers/userController');
const verifyLogin = require("../middlewares/session");



userRouter.get('/' , userController.getHome);

userRouter.get('/userLogin', userController.getUserLogin);

userRouter.post('/postLogin', userController.postLogin);

userRouter.get('/userSignup', userController.getUserSignup);

userRouter.post('/postSignup', userController.postSignup);

userRouter.get('/otpPage', userController.getOtpPage);

userRouter.get('/getForgotPassword', userController.getForgotPassword);

userRouter.post('/postForgotPassword', userController.postForgotPassword);

userRouter.get('/forgotOtpPage', userController.forgotOtpPage);

userRouter.post('/postForgotOtp', userController.postForgotOtp);

userRouter.post('/otp', userController.postOtp);

userRouter.get('/userLogout', userController.userLogout);

userRouter.get('/shop', verifyLogin.verifyLoginUser ,userController.getShopPage);

userRouter.get('/addToWishlist/:id', verifyLogin.verifyLoginUser ,userController.addToWishlist);

userRouter.get('/viewWishlist', verifyLogin.verifyLoginUser ,userController.viewWishlist);

userRouter.post('/removeFromWishlist', verifyLogin.verifyLoginUser ,userController.removeFromWishlist);

userRouter.get('/category/:id',verifyLogin.verifyLoginUser, userController.getCategoryWisePage);

userRouter.get('/productview/:id', verifyLogin.verifyLoginUser , userController.getProductViewPage);

userRouter.get('/addToCart/:id',verifyLogin.verifyLoginUser, userController.addToCart);

userRouter.get('/viewCart',verifyLogin.verifyLoginUser , userController.viewCart);

userRouter.post('/changeQuantity',verifyLogin.verifyLoginUser ,userController.changeQuantity,userController.totalAmount);

userRouter.post('/removeProduct', verifyLogin.verifyLoginUser ,userController. removeProduct);

userRouter.get('/viewProfile',verifyLogin.verifyLoginUser , userController.viewProfile);

userRouter.get('/editProfile',verifyLogin.verifyLoginUser , userController.editProfile);

userRouter.post('/postEditProfile',verifyLogin.verifyLoginUser , userController.postEditProfile);

userRouter.get('/changePassword',verifyLogin.verifyLoginUser , userController.getChangePassword);

userRouter.post('/postChangePassword',verifyLogin.verifyLoginUser , userController.postChangePassword);

userRouter.post('/addNewAddress',verifyLogin.verifyLoginUser , userController.addNewAddress);

userRouter.post("/placeOrder", verifyLogin.verifyLoginUser, userController.placeOrder);

userRouter.post("/verifyPayment", verifyLogin.verifyLoginUser, userController.verifyPayment);

userRouter.get('/paymentFail',verifyLogin.verifyLoginUser , userController.paymentFail);

userRouter.get('/checkout',verifyLogin.verifyLoginUser , userController.getCheckOutPage);

userRouter.get("/orderDetails", verifyLogin.verifyLoginUser, userController.orderDetails);

userRouter.get('/orderSuccess',verifyLogin.verifyLoginUser,userController.orderSuccess);

userRouter.get('/orderedProduct/:id',verifyLogin.verifyLoginUser,userController.orderedProduct);

userRouter.get('/cancelOrder/:id',verifyLogin.verifyLoginUser , userController.cancelOrder);




module.exports=userRouter;


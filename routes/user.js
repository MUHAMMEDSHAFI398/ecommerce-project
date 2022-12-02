const express = require('express');
const userRouter = express();
const userController = require('../controllers/userController');
const verifyLogin = require("../middlewares/session");



const bodyParser = require('body-parser');
userRouter.use(bodyParser.json());
userRouter.use(bodyParser.urlencoded({extended: true}));



userRouter.get('/', userController.getHome);
userRouter.get('/userLogin',userController.getUserLogin);
userRouter.get('/userSignup',userController.getUserSignup);
userRouter.post('/postSignup', userController.postSignup);
userRouter.post('/postLogin', userController.postLogin);
userRouter.get('/userLogout',userController.userLogout);
userRouter.get('/shop',verifyLogin.verifyLoginUser ,userController.getShopPage);
userRouter.get('/productview/:id',userController.getProductViewPage);
userRouter.get('/cart/:id',userController.addToCart);
userRouter.get('/checkout',userController.getCheckOutPage);
userRouter.get('/viewCart',userController.viewCart);
userRouter.post('/changeQuantity',userController.changeQuantity);
userRouter.post('/removeProduct',userController. removeProduct);
userRouter.get('/viewProfile',userController.viewProfile);
userRouter.get('/editProfile',userController.editProfile);
userRouter.get('/otp',userController.getOtpPage);
userRouter.post('/otp',userController.postOtp);


module.exports=userRouter;


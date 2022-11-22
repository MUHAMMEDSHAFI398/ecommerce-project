const express = require('express');
const userRouter = express();
// const path=require('path');
const userController = require('../controllers/userController');


// userRouter.set('view engine','ejs');
// userRouter.set('views','./views');


const bodyParser = require('body-parser');

userRouter.use(bodyParser.json());
userRouter.use(bodyParser.urlencoded({extended: true}));

userRouter.get('/', userController.getHome);
userRouter.get('/userLogin',userController.getUserLogin);
userRouter.get('/userSignup',userController.getUserSignup);
userRouter.post('/postSignup', userController.postSignup);
userRouter.post('/postLogin', userController.postLogin);
userRouter.get('/userLogout',userController.userLogout);


module.exports=userRouter;


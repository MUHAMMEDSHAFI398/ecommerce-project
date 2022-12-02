const express = require('express');
const adminRouter = express();
const path=require('path');
const adminController = require('../controllers/adminController');
const verifyLogin = require("../middlewares/session");


const bodyParser = require('body-parser');
adminRouter.use(bodyParser.json());
adminRouter.use(bodyParser.urlencoded({extended: true}));



adminRouter.get('/', adminController.getAdminLogin);
adminRouter.post('/postAdminLogin', adminController.postAdminLogin);
adminRouter.get('/adminHome', adminController.getAdminHome);
adminRouter.get('/adminLogout', adminController.adminLogout);
adminRouter.get('/userDetails', adminController.getAllusers);
adminRouter.get('/blockUser/:id', adminController.blockUser);
adminRouter.get('/unblockUser/:id', adminController.unblockUser);
adminRouter.get('/productDetails', adminController.productdetails);
adminRouter.get('/addProducts', adminController.addproducts);
adminRouter.post('/postProduct',adminController.postProduct);
adminRouter.get('/editProduct/:id', adminController.editProduct);
adminRouter.post('/postEditProduct/:id',adminController.postEditProduct);
adminRouter.get('/deleteProduct/:id', adminController.deleteProduct);
adminRouter.get('/category', adminController.getcategory);
adminRouter.post('/addCategory', adminController.addCategory);
adminRouter.post('/editCategory/:id', adminController.editCategory);
adminRouter.get('/deleteCategory/:id', adminController.deleteCategory);




module.exports=adminRouter;
const express = require('express');
const adminRouter = express();
const path=require('path');
const adminController = require('../controllers/adminController');
const verifyLogin = require("../middlewares/session");



adminRouter.get('/', adminController.getAdminLogin);
adminRouter.post('/postAdminLogin', adminController.postAdminLogin);
adminRouter.get('/adminLogout', adminController.adminLogout);
adminRouter.get('/userDetails', verifyLogin.verifyLoginAdmin , adminController.getAllusers);
adminRouter.get('/blockUser/:id', adminController.blockUser);
adminRouter.get('/unblockUser/:id', adminController.unblockUser);
adminRouter.get('/productDetails', verifyLogin.verifyLoginAdmin , adminController.productdetails);
adminRouter.get('/addProducts', verifyLogin.verifyLoginAdmin , adminController.addproducts);
adminRouter.post('/postProduct',adminController.postProduct);
adminRouter.get('/editProduct/:id', verifyLogin.verifyLoginAdmin , adminController.editProduct);
adminRouter.post('/postEditProduct/:id',adminController.postEditProduct);
adminRouter.get('/deleteProduct/:id', adminController.deleteProduct);
adminRouter.get('/restoreProduct/:id', adminController.restoreProduct);
adminRouter.get('/category', verifyLogin.verifyLoginAdmin , adminController.getcategory);
adminRouter.post('/addCategory', adminController.addCategory);
adminRouter.post('/editCategory/:id', adminController.editCategory);
adminRouter.get('/deleteCategory/:id', adminController.deleteCategory);
adminRouter.get('/order',verifyLogin.verifyLoginAdmin , adminController.getOrders);




module.exports=adminRouter;
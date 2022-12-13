const express = require('express');
const adminRouter = express();
const path=require('path');
const adminController = require('../controllers/adminController');
const verifyLogin = require("../middlewares/session");



adminRouter.get('/', adminController.getAdminLogin);
adminRouter.post('/postAdminLogin', adminController.postAdminLogin);
adminRouter.get('/dashboard', verifyLogin.verifyLoginAdmin , adminController.getdashboard);
adminRouter.get('/adminLogout', adminController.adminLogout);
adminRouter.get('/userDetails', verifyLogin.verifyLoginAdmin , adminController.getAllusers);
adminRouter.get('/blockUser/:id',verifyLogin.verifyLoginAdmin , adminController.blockUser);
adminRouter.get('/unblockUser/:id',verifyLogin.verifyLoginAdmin , adminController.unblockUser);
adminRouter.get('/productDetails', verifyLogin.verifyLoginAdmin , adminController.productdetails);
adminRouter.get('/addProducts', verifyLogin.verifyLoginAdmin , adminController.addproducts);
adminRouter.post('/postProduct',verifyLogin.verifyLoginAdmin ,adminController.postProduct);
adminRouter.get('/editProduct/:id', verifyLogin.verifyLoginAdmin , adminController.editProduct);
adminRouter.post('/postEditProduct/:id',verifyLogin.verifyLoginAdmin ,adminController.postEditProduct);
adminRouter.get('/deleteProduct/:id',verifyLogin.verifyLoginAdmin , adminController.deleteProduct);
adminRouter.get('/restoreProduct/:id',verifyLogin.verifyLoginAdmin , adminController.restoreProduct);
adminRouter.get('/category', verifyLogin.verifyLoginAdmin , adminController.getcategory);
adminRouter.post('/addCategory',verifyLogin.verifyLoginAdmin , adminController.addCategory);
adminRouter.post('/editCategory/:id',verifyLogin.verifyLoginAdmin , adminController.editCategory);
adminRouter.get('/deleteCategory/:id',verifyLogin.verifyLoginAdmin , adminController.deleteCategory);
adminRouter.get('/restoreCategory/:id',verifyLogin.verifyLoginAdmin , adminController.restoreCategory);
adminRouter.get('/coupen',verifyLogin.verifyLoginAdmin , adminController.getCoupenPage);
adminRouter.get('/order',verifyLogin.verifyLoginAdmin , adminController.getOrders);
adminRouter.get('/orderedProduct/:id',verifyLogin.verifyLoginAdmin , adminController.getOrderedProduct);
adminRouter.post('/orderStatuschange/:id',verifyLogin.verifyLoginAdmin , adminController.orderStatuschange);





module.exports=adminRouter;
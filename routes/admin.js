const express = require('express');
const adminRouter = express();
const path=require('path');
const adminController = require('../controllers/adminController');
const verifyLogin = require("../middlewares/session");



adminRouter.get('/', adminController.getAdminLogin);

adminRouter.post('/postAdminLogin', adminController.postAdminLogin);

adminRouter.get('/salesReport', verifyLogin.verifyLoginAdmin , adminController.salesReport);

adminRouter.get('/dailyReport', verifyLogin.verifyLoginAdmin , adminController.dailyReport);

adminRouter.get('/monthlyReport', verifyLogin.verifyLoginAdmin , adminController.monthlyReport);

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

adminRouter.get('/coupon',verifyLogin.verifyLoginAdmin , adminController.getCouponPage);

adminRouter.post('/addCoupon',verifyLogin.verifyLoginAdmin,adminController.addCoupon);

adminRouter.get('/order',verifyLogin.verifyLoginAdmin , adminController.getOrders);

adminRouter.get('/orderedProduct/:id',verifyLogin.verifyLoginAdmin , adminController.getOrderedProduct);

adminRouter.post('/orderStatuschange/:id',verifyLogin.verifyLoginAdmin , adminController.orderStatuschange);

adminRouter.get('/deleteCoupen/:id',verifyLogin.verifyLoginAdmin , adminController.deleteCoupon);

adminRouter.get('/restoreCoupen/:id',verifyLogin.verifyLoginAdmin , adminController.restoreCoupon);

adminRouter.post('/editCoupon/:id',verifyLogin.verifyLoginAdmin , adminController.editCoupon);

adminRouter.get('/getBanner',verifyLogin.verifyLoginAdmin , adminController.getBanner);

adminRouter.post('/addBanner',verifyLogin.verifyLoginAdmin , adminController.addBanner);

adminRouter.post('/editBanner/:id',verifyLogin.verifyLoginAdmin , adminController.editBanner);

adminRouter.get('/deleteBanner/:id',verifyLogin.verifyLoginAdmin , adminController.deleteBanner);

adminRouter.get('/restoreBanner/:id',verifyLogin.verifyLoginAdmin , adminController.restoreBanner);









module.exports=adminRouter;
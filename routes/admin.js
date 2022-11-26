const express = require('express');
const adminRouter = express();
const path=require('path');
const adminController = require('../controllers/adminController');


adminRouter.set('view engine','ejs');
adminRouter.set('views','./views');

const bodyParser = require('body-parser');

adminRouter.use(bodyParser.json());
adminRouter.use(bodyParser.urlencoded({extended: true}));

adminRouter.get('/', adminController.getAdminLogin);
adminRouter.post('/postAdminLogin', adminController.postAdminLogin);
adminRouter.get('/admin_home', adminController.getAdminHome);
adminRouter.get('/adminLogout', adminController.adminLogout);
adminRouter.get('/userDetails', adminController.getAllusers);
adminRouter.get('/blockuser/:id', adminController.blockUser);
adminRouter.get('/unblockuser/:id', adminController.unblockUser);
adminRouter.get('/productdetails', adminController.productdetails);
adminRouter.get('/addproducts', adminController.addproducts);
adminRouter.post('/postproduct',adminController.postProduct);
adminRouter.get('/editproduct/:id', adminController.editProduct);
adminRouter.post('/post_editproduct/:id',adminController.postEditProduct);
adminRouter.get('/deleteproduct/:id', adminController.deleteProduct);
adminRouter.get('/category', adminController.getcategory);
adminRouter.post('/addcategory', adminController.addCategory);
adminRouter.post('/editcategory/:id', adminController.editCategory);
adminRouter.get('/deletecategory/:id', adminController.deleteCategory);



module.exports=adminRouter;
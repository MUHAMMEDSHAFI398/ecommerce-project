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

module.exports=adminRouter;
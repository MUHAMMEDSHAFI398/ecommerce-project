const user = require('../model/userModal')
const products = require('../model/productModal');
const categories = require('../model/categoryModal');
const order =require('../model/orderModal')
const mongoose = require("mongoose");


module.exports = {
    getAdminLogin : (req, res) => {
        let admin = req.session.admin
        if (admin) {
            res.render('admin/adminHome')
        } else {
            res.render('admin/login')
        }
    },
    postAdminLogin : (req, res) => {
        if (req.body.email === process.env.admin_email && req.body.password === process.env.admin_pass) {
    
            req.session.admin = process.env.admin_email
            res.redirect('/admin')
        } else {
            res.render('admin/login', { invalid: 'invalid username or password ' })
    
        }
    },
    adminLogout : (req, res) => {
        req.session.destroy();
        res.redirect('/admin');
    },
    getAllusers : async (req, res) => {

        let users = await user.find()
        res.render('admin/userDetails', { users })
    
    },
    blockUser : async (req, res) => {

        const id = req.params.id;
        await user.updateOne({ _id: id }, { $set: { isBlocked: true } }).then(() => {
            res.redirect("/admin/userDetails");
        })
    },
    unblockUser : async (req, res) => {
        const id = req.params.id;
        await user.updateOne({ _id: id }, { $set: { isBlocked: false } }).then(() => {
            res.redirect("/admin/userDetails");
        })
    },
    addproducts : async (req, res) => {
        let category = await categories.find()
        res.render('admin/addproducts', { category })
    },
    productdetails :async (req, res) => {

        let product = await products.find().populate('category')
        res.render("admin/productdetails", { product })
    
    },
    postProduct : async (req, res) => {

        let categoryId =req.body.category
        
        const image = req.files.product_image;
        const Product = new products({
            product_name: req.body.product_name,
            price: req.body.price,
            category: categoryId,
            description: req.body.description,
            stock: req.body.stock
        })
        const productDetails = await Product.save()
        if (productDetails) {
            let productId = productDetails._id;
            image.mv('./public/adminimages/' + productId + '.jpg', (err) => {
                if (!err) {
                    res.redirect('/admin/productdetails')
                } else {
                    console.log(err)
                }
            })
    
        }
    },
    editProduct : async (req, res) => {

        const id = req.params.id;
        let category = await categories.find()
        const productData = await products.findOne({ _id: id });
        res.render('admin/editproduct', { productData, category })
    
    },
    deleteProduct : async (req, res) => {
    
        const id = req.params.id;
        await products.updateOne({ _id: id }, { $set: { delete: true } })
        res.redirect('/admin/productdetails')
    
    },
    restoreProduct : async (req,res)=>{

        const id = req.params.id;
        await products.updateOne({ _id: id }, { $set: { delete: false } })
        res.redirect('/admin/productdetails')
    },
    getcategory : async (req, res) => {

        const Category = await categories.find()
    
        const categoryExist = req.session.categoryExist
        req.session.categoryExist = ""
    
        const fieldEmpty = req.session.fieldEmpty
        req.session.fieldEmpty = ""
    
        const editCategoryExist =req.session.editCategoryExist
        req.session.editCategoryExist = ""
    
        const editFieldEmpty = req.session.editFieldEmpty
        req.session.editFieldEmpty=""
    
        res.render('admin/category', { Category, fieldEmpty, categoryExist,editFieldEmpty ,editCategoryExist})
    
    },
    addCategory : async (req, res) => {

        if (req.body.category_name) {
            const category_name = req.body.category_name
            const category = await categories.findOne({ category_name: category_name })
    
            if (category) {
                req.session.categoryExist = "Category already exist"
                res.redirect('/admin/category')
            } else {
                const Category = new categories({
                    category_name: req.body.category_name
                })
                await Category.save()
                res.redirect('/admin/category')
            }
        } else {
            req.session.fieldEmpty = "Field can not be empty"
            res.redirect('/admin/category')
        }
        
    },
    editCategory : async (req, res) => {

        if (req.body.category_name) {
    
            const category_name = req.body.category_name
            const id = req.params.id;
            const category = await categories.findOne({ category_name: category_name })
            if (category) {
    
                req.session.editCategoryExist = "Category already exist"
                res.redirect('/admin/category')
    
            } else {
                await categories.updateOne({ _id: id }, {
                    $set: {
                        category_name: req.body.category_name
                    }
                });
                res.redirect('/admin/category')
            }
        }else{
            req.session.editFieldEmpty = "Edit field can not be empty"
            res.redirect('/admin/category')
        }
    
    },
    deleteCategory : async (req, res) => {

        const id = req.params.id;
        await categories.deleteOne({ _id: id })
        res.redirect('/admin/category')
    
    },
    postEditProduct : async (req, res) => {

        const id = req.params.id;
        await products.updateOne({ _id: id }, {
            $set: {
                product_name: req.body.product_name,
                price: req.body.price,
                category: req.body.category,
                description: req.body.description,
                stock: req.body.stock
            }
        });
        if (req?.files?.product_image) {
            const image = req.files.product_image;
            image.mv('./public/adminimages/' + id + '.jpg', (err) => {
                if (!err) {
                    res.redirect('/admin/productdetails')
                } else {
                    console.log(err)
                }
            })
        } else {
            res.redirect('/admin/productdetails')
        }
    
    },
    getOrders : async (req,res)=>{

        let orderDetails= await order.aggregate([
             {
               $lookup: {
                 from: "products",
                 localField: "orderItems.productId",
                 foreignField: "_id",
                 as: "product",
               },
             },
             {
               $lookup: {
                 from: "users",
                 localField: "userId",
                 foreignField: "_id",
                 as: "user",
               },
             },
           ])
             res.render("admin/orders", { orderDetails });
           
        //    console.log(orderDetails );     
         
     },
     getOrderedProduct: async (req,res)=>{
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
        res.render('admin/orderedProduct',{productData})
     },
     orderStatuschange: async (req,res)=>{
         const id = req.params.id;
         const data = req.body;
         await order.updateOne(
            {_id:id},
            {
                $set: {
                    orderStatus: data.orderStatus,
                    paymentStatus: data.paymentStatus,
                  }
            }
         )
         res.redirect("/admin/order");
     }
        
        
    }
    
    















  


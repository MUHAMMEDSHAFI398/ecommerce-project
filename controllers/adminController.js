const express = require('express');
const body = require('body-parser');
const adminRouter = require('../routes/admin');
const user = require('../model/userModal')
const products = require('../model/productModal');
const admin = { email: 'admin@gmail.com', password: 'pass' }



const getAdminLogin = (req,res)=>{
    let admin=req.session.admin
    if(admin){
        res.render('admin/admin_home')
    }else{
        res.render('admin/login')
    }
    
}
const getAdminHome = (req,res)=>{
    let admin=req.session.admin
    if(admin){
        res.render('admin/admin_home')
    }else{
        res.render('admin/login')
    }
}
const postAdminLogin = (req,res)=>{
    if (req.body.email === admin.email && req.body.password === admin.password) {
        
        req.session.admin = admin.email
        res.redirect('/admin/admin_home')
    } else {
        res.render('admin/login',{ invalid : 'invalid username or password '})
        
    }
}

const adminLogout = (req,res)=>{
    req.session.destroy();
      res.redirect('/admin');
}

const getAllusers = async (req,res)=>{
    let admin=req.session.admin
    if(admin){
        let users = await user.find()
        res.render('admin/userDetails',{ users })
    }else{
        res.redirect('/admin')
    }
}
const blockUser = async (req,res)=>{
    const id = req.params.id;
    console.log(id);
    await user.updateOne({_id:id},{$set:{isBlocked:true}}).then(()=>{
        res.redirect("/admin/userDetails");
    })
}
const unblockUser = async (req,res)=>{
    const id = req.params.id;
    // console.log(id);
    await user.updateOne({_id:id},{$set:{isBlocked:false}}).then(()=>{
        res.redirect("/admin/userDetails");
    })
}
const addproducts = (req,res)=>{
    res.render('admin/addproducts')
}
const productdetails = async (req,res)=>{
    let admin=req.session.admin
    if(admin){
        let product = await products.find()
        res.render("admin/productdetails",{product})
    }else{
        res.redirect('/admin')
    }    
}
const postProduct = async (req,res)=>{
    const image = req.files.product_image;
    const Product = new products({
        product_name: req.body.product_name,
        price: req.body.price,
        category: req.body.category,
        description: req.body.description,
        stock: req.body.stock
      })
      const productDetails = await Product.save()
      if(productDetails){
        let productId = productDetails._id;
        image.mv('./public/adminimages/'+productId+'.jpg',(err)=>{
            if(!err){
                res.redirect('/admin/productdetails')
            }else{
                console.log(err)
            }
        } )
      
      }
}
const editProduct = async (req,res)=>{
     res.render('admin/editproduct') 
}
const deleteProduct = async (req,res)=>{
    const id = req.params.id;
    await products.deleteOne({_id:id}).then(()=>{
        res.redirect('/admin/productdetails')
    })
}
const category =(req,res)=>{
    res.render('admin/category')
}

 

module.exports = {
    getAdminLogin,
    postAdminLogin,
    getAdminHome,
    adminLogout,getAllusers,
    blockUser,
    unblockUser,
    addproducts,
    productdetails,
    postProduct,
    editProduct,
    deleteProduct,
    category
}


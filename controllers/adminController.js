const express = require('express');
const body = require('body-parser');
const adminRouter = require('../routes/admin');
const userDetails = require('../model/userModal')
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
        let users = await userDetails.find()
        res.render('admin/userDetails',{ users })
    }else{
        res.redirect('/admin')
    }
}
// const blockUser = (req,res)=>{
//     const id = req.params.id;
//     console.log(id);
//     userDetails.updateOne({_id:id},{$set:{isBlocked:true}}).then(()=>{
//         res.redirect("admin/userDetails");
//     })
// }



module.exports = {getAdminLogin,postAdminLogin,getAdminHome,adminLogout,getAllusers}
const express = require('express');
const body = require('body-parser');
const userRouter = require('../routes/user');
const user = require('../model/userModal');
const bcrypt = require('bcrypt');


const securepassword = async (password) => {
  try {
    const passwordhash = await bcrypt.hash(password, 10)
    return passwordhash
  } catch {
    console.log(error)
  }
}

const getHome = (req, res) => {
  let user=req.session.user
  if(user){
    customer=true
  }else{
    customer=false
  }
  res.render('user/index',{customer});
}
const getUserLogin = (req, res) => {
  res.render('user/login')
}
const getUserSignup = (req, res) => {
  res.render('user/Signup')
}

const postSignup = async (req, res) => {
  console.log(Error);
  try {
    const spassword = await securepassword(req.body.password)
    const User = new user({
      name: req.body.name,
      email: req.body.email,
      phonenumber: req.body.phonenumber,
      password: spassword
    })
    const userData = await User.save()
    res.redirect('/')
  } catch (error) {
    console.log(error.message)
    res.status(500).send(error)
  }
}

const postLogin = async (req, res) => {
  const email = req.body.email
  const password = req.body.password
  const userData = await user.findOne({email:email});
  console.log(userData)

  if(userData.isBlocked === false){
    try {
      if(userData){
        const passwordMatch = await bcrypt.compare(password, userData.password)
        if(passwordMatch){
          req.session.user=req.body.email
          res.redirect('/');
        }else {
          res.render('user/login',{invalid:"invalid username or password"});
        }
      }else{
        res.render('user/login',{invalid:"invalid username or password"});
      }
    } catch (error) {
     console.log(error)
    }
  }else{
    res.render('user/login',{userblock:"You are blocked"});
  }
 
}
const userLogout = (req,res)=>{
  req.session.destroy();
    res.redirect('/');
}







// await bcrypt.hash(req.body.password,10);

module.exports = { getHome, getUserLogin, getUserSignup, postSignup, postLogin ,userLogout};

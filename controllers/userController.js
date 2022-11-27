const express = require('express');
const body = require('body-parser');
const userRouter = require('../routes/user');
const user = require('../model/userModal');
const bcrypt = require('bcrypt');
const products = require('../model/productModal');


const securepassword = async (password) => {
  try {
    const passwordhash = await bcrypt.hash(password, 10)
    return passwordhash
  } catch {
    console.log(error)
  }
}

module.exports = {


  getHome: async (req, res) => {
    let user = req.session.user
    let product = await products.find()
    if (user) {
      customer = true
    } else {
      customer = false
    }
    res.render('user/index', { customer, product });
  },
  getUserLogin: (req, res) => {
    res.render('user/login')
  },
  getUserSignup: (req, res) => {
    res.render('user/Signup')
  },

  postSignup: async (req, res) => {
    console.log("hello");
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
  },

  postLogin: async (req, res) => {
    const email = req.body.email
    const password = req.body.password
    const userData = await user.findOne({ email: email });
    console.log(userData)


    try {
      if (userData) {
        if (userData.isBlocked === false) {
          const passwordMatch = await bcrypt.compare(password, userData.password)
          if (passwordMatch) {
            req.session.user = req.body.email
            res.redirect('/');
          } else {
            res.render('user/login', { invalid: "invalid username or password" });
          }
        } else {
          res.render('user/login', { userblock: "You are blocked" });
        }
      } else {
        res.render('user/login', { invalid: "invalid username or password" });
      }
    } catch (error) {
      console.log(error)
    }


  },
  userLogout: (req, res) => {
    req.session.destroy();
    res.redirect('/');
  },

  getShopPage: async (req, res) => {
    let user = req.session.user
    let product = await products.find()
    if (user) res.render('user/shop', { product });
    else res.render('user/login');

  },
  getProductViewPage: async (req, res) => {
    res.render('user/product_view');

  }

}







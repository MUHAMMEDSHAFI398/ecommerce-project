const Razorpay = require("razorpay");
const dotenv = require("dotenv");
dotenv.config();

const instance = new Razorpay({
  key_id: process.env.KEYID,
  key_secret: process.env.KETSECRET,
});

module.exports = instance;
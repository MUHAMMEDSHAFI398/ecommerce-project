const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    otp:{
        type: Number,
        required: true
    },
    email :{
        type: String
    }
})

const otp = mongoose.model('otp',otpSchema);
module.exports = otp;
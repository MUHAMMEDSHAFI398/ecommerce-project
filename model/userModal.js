const mongoose = require('mongoose');


 const userSchema = new mongoose.Schema({


    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        trim: true
    },
    phonenumber: {
        type: Number,
        required: true,
        trim: true,
        unique: true
    },
    password:{
        type: String,
        required: true,
        trim: true,
        
    },
    isBlocked:{
        type:Boolean,
        default:false
    }

 })

const user = mongoose.model('user',userSchema);
 module.exports = user

const mongoose = require('mongoose');


 const userSchema = new mongoose.Schema({


    name: {
        type: String,
        required: true,
        
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
    addressDetails: [
        {
          housename: {
            type: String,
          },
          area: {
            type: String,
          },
          landmark: {
            type: String,
          },
          district: {
            type: String,
          },
          postoffice:{
            type: String,
          },
          state: {
            type: String,
          },
          pin: {
            type: String,
          }
        }
      ],
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

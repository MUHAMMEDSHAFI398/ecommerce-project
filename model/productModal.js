const mongoose = require('mongoose');
 const validator = require('mongoose-unique-validator');

 const productSchema = new mongoose.Schema({


    product_name: {
        type: String,
        required: true,
        
    },
    price: {
        type: Number,
        required: true, 
    },
    category: {
        type: String,
        required: true,
    },
    description:{
        type: String,
        required: true,
    },
    stock:{
        type: Number,
        
    }

 })
//userSchema.plugin(validator)
const products = mongoose.model('products',productSchema);
 module.exports = products
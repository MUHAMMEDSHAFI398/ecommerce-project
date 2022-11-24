const mongoose = require('mongoose');
 const validator = require('mongoose-unique-validator');

 const categorySchema = new mongoose.Schema({


    category_name: {
        type: String,
        required: true
        
    }

 })
//userSchema.plugin(validator)
const category = mongoose.model('category',categorySchema);
 module.exports = category
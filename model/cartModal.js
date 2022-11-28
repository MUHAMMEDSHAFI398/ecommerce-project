const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
const cartSchema = new Schema({
  userId: {
    type:String,
    required: true,
  },
  product: [
    {
        productId:{
            type:ObjectId,
            required:true
        },
        quantity:{
            type:Number,
            required:true
        }
    }
  ],
});

const cart = mongoose.model('cart',cartSchema);
module.exports = cart;
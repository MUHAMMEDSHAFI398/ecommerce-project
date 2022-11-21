const express = require('express');
const app = express();
const path=require('path');
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/ecommerce');
const db = mongoose.connection;
db.on('error',console.log.bind(console,"connection error"));
db.once('open',function(callback){
    console.log("connection success");
});

const userRouter = require('./routes/user');
//const adminRouter = require('./userRoute/adminRoute');

app.set("views");
//app.use(express.static("views"));
app.set("view engine","ejs");
app.use(express.static(path.join(__dirname,'public')))

app.use('/',userRouter);

app.listen(5000,()=>{
    console.log("listening to port 5000")
});


// SET PATH=C:\Program Files\Nodejs;%PATH

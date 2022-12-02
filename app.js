const express = require('express');
const app = express();
const path=require('path');
const session = require('express-session');
const cookieParser = require("cookie-parser");
const fileUpload=require("express-fileupload");
const userRouter = require('./routes/user');
const adminRouter = require('./routes/admin');
const dotenv = require("dotenv");
dotenv.config()

const dbconnect = require("./config/connection");
dbconnect.dbconnect();
app.listen(process.env.PORTNO, () => {
    console.log("server started listening to port 5000");
  });


app.set("views");
//app.use(express.static("views"));
app.set("view engine","ejs");
app.use(express.static(path.join(__dirname,'public')))


app.use(session({
    secret: "thisismysecretkey",
    saveUninitialized: true,
    cookie: { maxAge: 6000000 },
    resave: false,
}))
app.use(cookieParser());
app.use(fileUpload());

//to prevent storing cache

app.use((req, res, next) => {
    res.set(
        "Cache-Control",
        "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0"
    );
    next();
})

app.use('/',userRouter);
app.use('/admin',adminRouter)


// SET PATH=C:\Program Files\Nodejs;%PATH

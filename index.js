const express = require("express");
const app = express();
const ejs = require("ejs");
const session = require("express-session");
const config = require("./config/config");
const nocache = require("nocache");
const multer=require('multer')
// const errorHandler=require('./middleware/errorhandler')


const mongoose = require("mongoose");
mongoose
  .connect("mongodb://127.0.0.1:27017/shoeniverse")
  .then(() => console.log("Connected to database"))
  .catch(() => console.log("error!! failed to connect database"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(
  session({
    secret: config.sessionSecret,
    resave: true,
    saveUninitialized: true,
  })
);
app.get('/admin/productList',);


//to access static files like css

//for nocache

app.use(nocache());


//Error HANDLER

// error Handle
// app.use(errorHandler.error404);
// app.use(errorHandler.error500);


//for user routes
const userRoute = require("./router/userRouter");
const admin_route = require("./router/adminRouter");
app.use("/", userRoute);
app.use("/admin", admin_route);

app.listen(3700, function () {
  console.log("server running,http://127.0.0.1:3700");
});



app.use((req, res, next) => {
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.header('Expires', '-1');
  res.header('Pragma', 'no-cache');
  next();
});


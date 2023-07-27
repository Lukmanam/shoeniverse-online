const express=require('express')
const user_Route=express();
const auth = require("../middleware/auth");
const session=require("express-session");
const userController = require('../controller/userController');
const config=require("../config/config")



user_Route.use(
    session({
        secret:config.sessionSecret,
        saveUninitialized:true,
        resave:true
    })
)

user_Route.set('view engine','ejs')
user_Route.set('views','./views/user')


//LOGIN///////////////
user_Route.get('/login',auth.isLogout, userController.loadLogin)
user_Route.post('/login',userController.verifyLogin)
// user_Route.get("/home",auth.isLogin,userController.loadhome)


// SIGNUP/////////////
user_Route.get('/signup',auth.isLogout,userController.loadsignup)
user_Route.post('/signup',userController.insertUser)

//OTP/////////////////
user_Route.post('/otp',userController.otpValidation)


//resend OTP for 
user_Route.get('/resend/:email',userController.resendOTPlogin)
user_Route.get('/resend/:email',userController.resendOTPreg)
// LOGOUT////////////
user_Route.get("/logout",auth.isLogin,userController.userLogout)
user_Route.get('/', userController.loadhome)
user_Route.get('/shop',userController.loadshop)
user_Route.get('/about',userController.loadabout)
user_Route.get('/contact',userController.loadcontact)
user_Route.get('/product-single',userController.loadproduct)
user_Route.get('/checkout',userController.loadcheckout)
user_Route.get('/cart',userController.loadcart)
user_Route.get('/wishlist',userController.loadwishlist)





module.exports = user_Route
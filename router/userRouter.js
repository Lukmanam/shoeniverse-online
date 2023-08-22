const express = require("express");
const user_Route = express();
const auth = require("../middleware/auth");
const session = require("express-session");
const userController = require("../controller/userController");
const productController = require("../controller/productController");
const addressController = require("../controller/addressController");
const config = require("../config/config");
const cartController = require("../controller/cartController");
const orderController = require("../controller/orderController");
const couponController = require("../controller/couponController");

user_Route.use(session({secret: config.sessionSecret, saveUninitialized: true, resave: true,}));
user_Route.set("view engine", "ejs");
user_Route.set("views", "./views/user");


//LOGIN///////////////
user_Route.get("/login", auth.isLogout, userController.loadLogin);
user_Route.post("/login", auth.isLogout, userController.verifyLogin);
// user_Route.get("/home",auth.isLogin,userController.loadhome)


// SIGNUP/////////////
user_Route.get("/signup", userController.loadsignup);
user_Route.post("/signup", userController.insertUser);


//OTP/////////////////
user_Route.post("/otp", auth.isLogout, userController.otpValidation);
user_Route.post("/otplogin", auth.isLogout, userController.otpValidationlogin);


//resend OTP for
user_Route.get("/resend/:email", userController.resendOTPlogin);
user_Route.get("/resend/:email", userController.resendOTPreg);


// LOGOUT////////////
user_Route.get("/logout", userController.userLogout);
user_Route.get("/", userController.loadhome);
user_Route.get("/shop", userController.loadshop);
user_Route.get("/about", userController.loadabout);
user_Route.get("/contact", userController.loadcontact);
// user_Route.get('/product-single',userController.loadproduct)
user_Route.get("/wishlist", userController.loadwishlist);
user_Route.get("/productDetailS", productController.loadProductDetail);


//PROFILE////////////////////////////////////////////////
user_Route.get("/profile", auth.isLogin, userController.loadprofile);


//ADDRESS
user_Route.get("/address", auth.isLogin, addressController.loadAddress);
user_Route.get("/addAddress", auth.isLogin, addressController.loadAddaddress);
user_Route.post("/addAddress", addressController.addNewaddress);
// user_Route.get('/editAddress',auth.isLogin,addressController.loadEditAddress)


//CART/////////////////////////////////
//ADD TO CART
user_Route.get("/addToCart", auth.isLogin, cartController.addToCart);


//LOAD CART
user_Route.get("/cart", auth.isLogin, cartController.loadCart);


//REMOVE FROM CART
user_Route.get("/removeFromCart", auth.isLogin, cartController.removeFromCart);


//CHANGE QUntity
user_Route.post( "/changeProductQuantity",auth.isLogin,cartController.changeQuantity);


//checkout
user_Route.get("/checkout", auth.isLogin, cartController.loadCheckout);

//CHANGE PASSWORD
user_Route.get( "/changePassword",auth.isLogin,userController.loadchangePassword);
user_Route.post("/changePassword", auth.isLogin, userController.changePassword);
user_Route.get("/editProfile", auth.isLogin, userController.loadEditProfile);
user_Route.post("/editprofile", auth.isLogin, userController.editProfile);

// user_Route.post('/changeProductQuantity',auth.isLogin,cartController.changeQuantity);


//PLACE ORDER////////////////////////////
user_Route.post("/checkout", auth.isLogin, orderController.placeOrder);
user_Route.post("/verifyPayment", auth.isLogin, orderController.verifyPayment);
user_Route.get("/loadOrderCompleted", auth.isLogin,orderController.loadOrderCompleted);
user_Route.get("/showOrders", auth.isLogin, orderController.orderHistory);
user_Route.get("/orderDetails", auth.isLogin, orderController.loadorderdetails);
user_Route.post("/cancelOrder", orderController.cancelOrder);


//forgot Password
user_Route.get("/forgotPassword", userController.loadforgotPassword);
user_Route.post("/forgotPassword", userController.forgotPassword);
user_Route.get("/changeforgotPassword",userController.loadchangeforgotPassword);
user_Route.post("/changeforgotPassword",userController.changeForgotPassword);


//user_Route
user_Route.post("/applyCoupon", auth.isLogin, couponController.applycoupon);

module.exports = user_Route;

const express = require('express');
const admin_route = express();
const session=require("express-session")
const config=require("../config/config")
const productController=require("../controller/productController")
const adminAuth=require('../middleware/adminAuth')
const upload = require('../middleware/upload');
const orderController=require('../controller/orderController')
admin_route.use(session({ secret: config.sessionSecret }));
const adminController = require('../controller/adminController');
// Assuming you have set up the route like this in your backend
// app.get('/admin/productList', loadproductlist);


admin_route.set("view engine", "ejs");
admin_route.set("views", "./views/admin");

admin_route.get("/logout",adminAuth.isLogin,adminController.adminLogout)



admin_route.get('/',adminAuth.isLogout,adminController.loadLogin)
admin_route.post('/',adminController.verifyLogin)


admin_route.get('/userlist',adminController.loaduserlist)
admin_route.get('/dashboard',adminAuth.isLogin,adminController.loaddashboard)


//userblock patch
admin_route.patch('/blockUser',adminController.blockUser)

//CATEGORY PAGES(LOAD,ADD,EDIT,LIST UNLIST)
admin_route.get('/category',adminAuth.isLogin,adminController.loadCategory)
admin_route.patch('/unlistCategory',adminController.unlistCategory)
admin_route.get('/addCategory',adminAuth.isLogin,adminController.loadaddCategory)
admin_route.post('/addCategory',adminController.insertCategory)
admin_route.get('/editCategory',adminAuth.isLogin,adminController.loadEditcategory)
admin_route.post('/editCategory',adminController.editCategory)


//PRODUCT PAGES// (LIST,ADD,EDIT,DELETE)
admin_route.get('/productList',adminAuth.isLogin,productController.loadproductlist)
admin_route.get('/addProduct',adminAuth.isLogin,productController.loadaddProduct)
admin_route.post('/addProduct',upload.array('productImage',3), productController.addProduct)
admin_route.get('/editProduct',adminAuth.isLogin,productController.loadeditProduct)
admin_route.post('/editProduct',upload.array('productImage',3),productController.editProduct)
admin_route.get('/deleteImage',productController.deleteImage)


//DELETE PRODUCT///////////////////////////////////////////////////////////////////////
admin_route.patch('/unlistProduct',productController.unlistProduct)



//SHOW ORDER LIST
admin_route.get('/adminOrderlist',adminAuth.isLogin,orderController.adminOrderlist)
admin_route.get('/orderDetails',adminAuth.isLogin,orderController.showOrderDetails)


module.exports = admin_route
const express = require('express');
const admin_route = express();
const session = require("express-session")
const config = require("../config/config")
const productController = require("../controller/productController")
const adminAuth = require('../middleware/adminAuth')
const upload = require('../middleware/upload');
const orderController = require('../controller/orderController')
admin_route.use(session({ secret: config.sessionSecret }));
const adminController = require('../controller/adminController');
const couponController = require('../controller/couponController')
const bannerController=require('../controller/BannerController')
const offerController=require('../controller/offerController')
// Assuming you have set up the route like this in your backend
// app.get('/admin/productList', loadproductlist);


admin_route.set("view engine", "ejs");
admin_route.set("views", "./views/admin");

admin_route.get("/logout", adminAuth.isLogin, adminController.adminLogout)



admin_route.get('/', adminAuth.isLogout, adminController.loadLogin)
admin_route.post('/', adminController.verifyLogin)


admin_route.get('/userlist', adminController.loaduserlist)
admin_route.get('/dashboard', adminAuth.isLogin, adminController.loaddashboard)


//userblock patch
admin_route.patch('/blockUser', adminController.blockUser)

//CATEGORY PAGES(LOAD,ADD,EDIT,LIST UNLIST)
admin_route.get('/category', adminAuth.isLogin, adminController.loadCategory)
admin_route.patch('/unlistCategory', adminController.unlistCategory)
admin_route.get('/addCategory', adminAuth.isLogin, adminController.loadaddCategory)
admin_route.post('/addCategory', adminController.insertCategory)
admin_route.get('/editCategory', adminAuth.isLogin, adminController.loadEditcategory)
admin_route.post('/editCategory', adminController.editCategory)


//PRODUCT PAGES// (LIST,ADD,EDIT,DELETE)
admin_route.get('/productList', adminAuth.isLogin, productController.loadproductlist)
admin_route.get('/addProduct', adminAuth.isLogin, productController.loadaddProduct)
admin_route.post('/addProduct', upload.array('productImage', 5), productController.addProduct)
admin_route.get('/editProduct', adminAuth.isLogin, productController.loadeditProduct)
admin_route.post('/editProduct', upload.array('productImage', 5), productController.editProduct)
admin_route.get('/deleteImage', productController.deleteImage)


//DELETE PRODUCT///////////////////////////////////////////////////////////////////////
admin_route.patch('/unlistProduct', productController.unlistProduct)



//SHOW ORDER LIST//////////////////////////////////////////////////////////////////////
admin_route.get('/adminOrderlist', adminAuth.isLogin, orderController.adminOrderlist)
admin_route.get('/orderDetails', adminAuth.isLogin, orderController.showOrderDetails)
admin_route.get('/shipping', adminAuth.isLogin, orderController.shippedOrder)
admin_route.get('/delivered', adminAuth.isLogin, orderController.deliveredOrder)
admin_route.get('/cancelOrderadmin', adminAuth.isLogin, orderController.cancelOrderadmin)



//SALES REPORT/////////////////////////////////////////////////////////////////////////
admin_route.get('/salesReport',adminAuth.isLogin,orderController.salesReport)
//COUPON///////////////////////////////////////////////////////////////////////////////
admin_route.get('/couponList', adminAuth.isLogin, couponController.loadCouponlist)
admin_route.get('/addCoupon', adminAuth.isLogin, couponController.loadAddcoupon)
admin_route.post('/addCoupon', adminAuth.isLogin, couponController.addNewCoupon)
admin_route.get('/editCoupon', adminAuth.isLogin, couponController.loadeditCoupon)
admin_route.post('/editCoupon', adminAuth.isLogin, couponController.editCoupon)



//Banner///////////////////////////////////////////////////////////////////////////////
admin_route.get('/bannerlist',adminAuth.isLogin,bannerController.loadBanner)
admin_route.get('/addBanner',adminAuth.isLogin,bannerController.loadaddBanner)
admin_route.post('/addBanner',upload.single('image'),bannerController.addBanner)
admin_route.get('/editBanner',adminAuth.isLogin,bannerController.loadeditBanner)
admin_route.post('/editBanner',upload.single('image'),bannerController.editBanner)
admin_route.get('/deleteBanner',bannerController.deleteBanner)



//OFFER////////////////////////////////////////////////////////////////////////////////
admin_route.get('/offerlist',adminAuth.isLogin,offerController.loadOffer)
admin_route.get('/addOffer',adminAuth.isLogin,offerController.loadaddOffer)
admin_route.post('/addOffer',offerController.addOffer)
admin_route.patch('/apply-product-offer',productController.applyProductOffer)
admin_route.patch('/remove-product-offer',productController.removeProductOffer)



module.exports = admin_route
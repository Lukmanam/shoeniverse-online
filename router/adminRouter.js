const express = require('express');
const admin_route = express();

const session=require("express-session")
const config=require("../config/config")

admin_route.use(session({ secret: config.sessionSecret }));
const adminController = require('../controller/adminController');

admin_route.set("view engine", "ejs");
admin_route.set("views", "./views/admin");




admin_route.get('/',adminController.loadLogin)
admin_route.post('/',adminController.verifyLogin)


admin_route.get('/userlist',adminController.loaduserlist)
admin_route.get('/dashboard',adminController.loaddashboard)






module.exports = admin_route
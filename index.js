const express=require("express")
const app=express()
const ejs=require('ejs')


const mongoose=require('mongoose')
mongoose.connect('mongodb://127.0.0.1:27017/shoeniverse')
.then(()=>console.log("Connected to database"))
.catch(()=>console.log("error!! failed to connect database"));



app.use(express.json())
app.use(express.urlencoded({extended:true}));
app.use(express.static('public'));



//to access static files like css




//for nocache
const nocache=require("nocache");
app.use(nocache());

//for user routes
const userRoute=require("./router/userRouter");
const admin_route = require("./router/adminRouter");
app.use('/',userRoute)
app.use('/admin', admin_route)

app.listen(3700,function()
{
    console.log("server running,http://127.0.0.1:3700")
})

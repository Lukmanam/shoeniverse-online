const mongoose=require('mongoose')
const bannerSchema=new mongoose.Schema({
   
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    image:{
        type:String,
        required:true
    }
})
bannerModel=mongoose.model('banner',bannerSchema)
module.exports=bannerModel
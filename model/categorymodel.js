
const mongoose=require('mongoose')

const categorySchema= new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:false
    },
    blocked:{
        type:Boolean,
        default:false

    }
})

module.exports=mongoose.model('category',categorySchema)
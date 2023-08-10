const mongoose=require("mongoose");
const { array } = require("../middleware/upload");

const productSchema= new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    category:{
        type:String,
        // type:mongoose.Types.ObjectId,
        required:true,
        // ref:'category'

    },
    price:{
        type:String,
        required:true,
    },
    quantity:{
        type:Number,
        required:true
    },
    description:{
        type:String,
        required:true,
    },
    image:{
        type:Array,
        required:true
    },
    blocked:{
        type:Boolean,
        default:false,
    }

});

module.exports=mongoose.model("Products",productSchema);
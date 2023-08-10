const mongoose=require('mongoose');

const cartSchema=new mongoose.Schema({
    user:{
        type:mongoose.Types.ObjectId,
        ref:"user",
        required:true
    },
    userName:{
        type:String,
        required:true
    },
    products:[{
        productId:{
            type:mongoose.Types.ObjectId,
            ref:"Products",
            required:true
        },
        count: {
            type:Number,
            default:1
        },
        productPrice:
        {
            type:Number,
            required:true
        },
        totalPrice:{
            type:Number,
            default:0
        },
    }]
});


const cartModel=mongoose.model("cart",cartSchema);
module.exports=cartModel
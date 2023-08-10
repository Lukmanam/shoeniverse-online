const mongoose=require('mongoose')
const addressSchema= new mongoose.Schema({
    userId:{
        type:mongoose.Types.ObjectId,
        ref:'user',
        required:true
    },

    addresses:[{
        userName:{
            type:String,
            required:true
        },
        mobile:{
            type:Number,
            required:true
        },
        alternativeMob:{
            type:Number
        },
        address:{
            type:String,
            required:true

        },
        city:
        {
            type:String,
            required:true

        },
        state:{
            type:String,
            required:true
        },
        pincode:{
            type:Number,
            required:true

        },
        landmark:{
            type:String,
            required:true

        },
        createdAt:{
            type:Date,
            default:Date.now
        }


    }]
})

const addressModel=mongoose.model('address',addressSchema);
module.exports=addressModel;
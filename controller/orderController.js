const User=require("../model/usermodel")
const Product=require("../model/productModel")
const Cart=require("../model/cartModel")
const Order=require("../model/orderModel")
const Address=require("../model/addressModel")




const placeOrder=async(req,res)=>
{
    try {
        const userId=req.session.user_id;
        console.log(userId,"userid");
        const userData=await User.findOne({_id: userId});
        console.log(userData,"ddddd");
        const address=req.body.address;
        console.log(req.body);
        const paymentMethod=req.body.payment;
            console.log(address,"addrss Got")
        if(address&&paymentMethod)
        {
            const cartData=await Cart.findOne({ user:userId}).populate("products.productId")
        
        const products=cartData.products
        // let flag=0;
        // let productName,stockCount
        // products.forEach(product=>
        //     {
        //         if(product.count>product.productId.quantity)
        //         {
        //             flag=1
        //             productName=product.productId.name
        //             stockCount=product.productId.quantity
        //         }
        //     });
        //     if(flag==1)
        //     {
        //       res.json({stock:true, productName:productName, stockCount:stockCount});
        //     }
            const total=parseInt(req.body.amount);
            const grandTotal=parseInt(req.body.total);
            const status=paymentMethod==="COD" ? "placed" : "pending";
            const order=new Order({
                deliveryAddress:address,
                userId:userId,
                userName:userData.name,
                paymentMethod:paymentMethod,
                products:products,
                amount:total,
                totalAmount:grandTotal,
                date:new Date(),
                status:status
            })

            const orderData=await order.save()
            const date=orderData.date.toISOString().substring(5,7);
            const orderId= orderData._id

            if(orderData)
            {
                for(let i=0;i<products.length;i++)
                {
                    const productId=products[i].productId._id
                    const count=products[i].count
                    await Product.findByIdAndUpdate({_id:productId},{$inc:{quantity: -count}});
                }
                if(order.paymentMethod=="COD")
                {
                    await Order.updateOne({_id:orderId},{$set:{month:date}})
                    await Cart.deleteOne({user:userId})
                    res.json({codSuccess:true})
                }
            }
            else
            {
                res.redirect("/checkout");
            }
        }
        else
        {
            res.json({check:true})
        }
    } catch (error) {
        console.log(error.message);
    }
}
const loadOrderCompleted=async(req,res)=>
{
    try {
        const user=req.session.user_id
    res.render('ordercompleted',{user}) 
    } catch (error) {
        console.log(error.message);
        
    }
   
}

const orderHistory = async (req, res) => {
    try {
        const user=req.session.user_id
        // Fetch the user's order history from the database
        const orderHistory = await Order.find({ userId: req.session.user_id }).populate('products.productId');
        
        console.log(orderHistory);

        // Pass the order history data to the view
        res.render('showOrders', { orderHistory,user });
    } catch (error) {
        console.error(error.message);
        res.redirect('/'); // Redirect to profile page on error
    }
};
const adminOrderlist=async(req,res)=>
{
    try {
        const orderData=await Order.find({}).sort({date:-1})
       
        res.render('OrderList',{orders:orderData})
        
    } catch (error) {
        console.log(error.message);
    }
}
const showOrderDetails = async(req,res,next)=>{
    try {
        const orderId = req.query.id;
        const orderData = await Order.findOne({ _id: orderId }).populate('products.productId');
        const user = await User.findById({_id:orderData.userId});
        const products = orderData.products;
        res.render('orderDetails',{ order:orderData,products,user});
        
    } catch (error) {
        console.log(error.message);
        next(error);
    }
}









module.exports={
    placeOrder,
    loadOrderCompleted,
    orderHistory,
    adminOrderlist,
    showOrderDetails
   
}
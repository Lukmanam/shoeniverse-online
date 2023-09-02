const User = require("../model/usermodel");
const Product = require("../model/productModel");
const Cart = require("../model/cartModel");
const Order = require("../model/orderModel");
const Address = require("../model/addressModel");
const Razorpay = require("razorpay");
const coupon = require("../model/couponModel");
require("dotenv").config();
const ITEMS_PER_PAGE = 15;
const itemsPerPage=10

var instance = new Razorpay({
    key_id: "rzp_test_Lie7XPoiRsrtMV",
    key_secret: process.env.RAZORPAY_SECRET_KEY,
});

const placeOrder = async (req, res) => {
    try {
        const userId = req.session.user_id;
        console.log(userId, "userid");
        const userData = await User.findOne({ _id: userId });
        console.log(userData, "ddddd");
        const address = req.body.address;
        console.log(req.body);
        const paymentMethod = req.body.payment;
        console.log(address, "addrss Got");
        if (address && paymentMethod) {
            const cartData = await Cart.findOne({ user: userId }).populate(
                "products.productId"
            );

            const products = cartData.products;
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
            const total = parseInt(req.body.amount);
            const grandTotal = parseInt(req.body.total);
            const status = paymentMethod === "COD" ? "placed" : "pending";
            const order = new Order({
                deliveryAddress: address,
                userId: userId,
                userName: userData.name,
                paymentMethod: paymentMethod,
                products: products,
                amount: total,
                totalAmount: grandTotal,
                date: new Date(),
                status: status,
            });

            const orderData = await order.save();
            const date = orderData.date.toISOString().substring(5, 7);
            const orderId = orderData._id;
            console.log(orderData, "order data und");
            if (orderData) {
                for (let i = 0; i < products.length; i++) {
                    const productId = products[i].productId._id;
                    const count = products[i].count;
                    await Product.findByIdAndUpdate(
                        { _id: productId },
                        { $inc: { quantity: -count } }
                    );
                }
                if (order.paymentMethod == "COD") {
                    await Order.updateOne({ _id: orderId }, { $set: { month: date } });
                    await Cart.deleteOne({ user: userId });
                    res.json({ codSuccess: true });
                } else {
                    const orderId = orderData._id;
                    await Order.updateOne({ _id: orderId }, { $set: { month: date } });
                    const totalAmount = orderData.totalAmount;
                    var options = {
                        amount: totalAmount * 100,
                        currency: "INR",
                        receipt: "" + orderId,
                    };
                    instance.orders.create(options, function (err, order) {
                        res.json({ order });
                    });
                }
            } else {
                res.redirect("/checkout");
            }
        } else {
            res.json({ check: true });
        }
    } catch (error) {
        console.log(error.message);
    }
};
const loadOrderCompleted = async (req, res) => {
    try {
        const user = req.session.user_id;
        res.render("ordercompleted", { user });
    } catch (error) {
        console.log(error.message);
    }
};

const orderHistory = async (req, res) => {
    try {
        const user = req.session.user_id;
        // Fetch the user's order history from the database
        const orderHistory = await Order.find({
            userId: req.session.user_id,
        }).populate("products.productId");
        const Myorders = await Order.find({ userId: req.session.user_id })
            .sort({ date: -1 })
            .populate("products.productId");
        console.log(orderHistory);

        // Pass the order history data to the view
        res.render("showOrders", { orderHistory, user, Myorders });
    } catch (error) {
        console.error(error.message);
        res.redirect("/"); // Redirect to profile page on error
    }
};
const adminOrderlist = async (req, res) => {
    try {
        let { search, status, page, itemsPerPage } = req.query;
        page = parseInt(page) || 1;
        itemsPerPage = parseInt(itemsPerPage) || ITEMS_PER_PAGE;

        const query = {};

        if (search) {
            query._id = search;
        }

        if (status) {
            query.status = status;
        }

        const totalOrders = await Order.countDocuments(query);
        const totalPages = Math.ceil(totalOrders / itemsPerPage);

        // const order = await Order.find(query)
        //     .sort({ createdAt: -1 })
        //     .skip((page - 1) * itemsPerPage)
        //     .limit(itemsPerPage);

        const ordersPerPage = itemsPerPage; // Rename 'itemsPerPage' for clarity
        const skipAmount = (page - 1) * ordersPerPage;

        const order = await Order.find(query)
            .sort({ createdAt: -1 })
            .skip(skipAmount)
            .limit(ordersPerPage);


        if (order) {
            res.render("OrderList", {
                orders: order,
                search,
                status,
                currentPage: page,
                totalPages,
                itemsPerPage:ITEMS_PER_PAGE,
            });
        } else {
            res.render("./admin/orders", {
                admin: admin,
                message: "No order placed!!",
            });
        }
    } catch (error) {
        console.log(error.message);
    }
};



//const SALES REPORT///////////////////////
const salesReport = async (req, res) => {
    try {
        let { search, status, page, itemsPerPage, from, to } = req.query;
        status="Delivered"
        page = parseInt(page) || 1;
        itemsPerPage = parseInt(itemsPerPage) || ITEMS_PER_PAGE;
        
        const query = {};

        if (search) {
            query._id = search;
        }

        if (status) {
            query.status = status;
        }

        if (from && to) {
            query.createdAt = { $gte: new Date(from), $lte: new Date(to) };
        }

        const totalOrders = await Order.countDocuments(query);
        const totalPages = Math.ceil(totalOrders / itemsPerPage);

        const order = await Order.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * itemsPerPage)
            .limit(itemsPerPage);

        if (order) {
            res.render("salesReport", {
                orders: order,
                search,
                status,
                currentPage: page,
                totalPages,
                ITEMS_PER_PAGE,
                from,
                to
            });
        } else {
            res.render("./admin/salesReport", {
                admin: admin,
                message: "No order placed!!",
            });
        }
    } catch (error) {
        console.log(error.message);
    }
};


const showOrderDetails = async (req, res, next) => {
    try {
        const orderId = req.query.id;
        const orderData = await Order.findOne({ _id: orderId }).populate(
            "products.productId"
        );
        const user = await User.findById({ _id: orderData.userId });
        const products = orderData.products;
        res.render("orderDetails", { order: orderData, products, user });
    } catch (error) {
        console.log(error.message);
        next(error);
    }
};

const shippedOrder = async (req, res, next) => {
    try {
        const orderId = req.query.id;
        await Order.findByIdAndUpdate(orderId, { $set: { status: "Shipped" } });
        res.redirect("/admin/adminOrderList");
    } catch (error) {
        console.log(error.message);
        next(error);
    }
};

// order status changing to Delivered

const deliveredOrder = async (req, res) => {
    try {
        const orderId = req.query.id;
        await Order.findByIdAndUpdate(orderId, { $set: { status: "Delivered" } });
        res.redirect("/admin/adminOrderList");
    } catch (error) {
        console.log(error.message);
        next(error);
    }
};

const cancelOrder = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const orderId = req.body.orderId;
        const orderData = await Order.findOne({ _id: orderId });
        if (orderData) {
            if (orderData.status == "placed" || orderData.status == "shipped") {
                for (const product of orderData.products) {
                    const productId = product.productId;
                    const count = product.count;
                    await Product.findByIdAndUpdate(productId, {
                        $inc: { quantity: count },
                    });
                }
                await Order.findByIdAndUpdate(orderId, {
                    $set: { status: "Cancelled" },
                });
                res.json({ success: true });
            } else {
                await Order.findByIdAndUpdate(orderId, {
                    $set: { status: "Cancelled" },
                });
                res.json({ success: true });
            }
        } else {
            res.json({ success: false });
        }
    } catch (error) {
        console.log(error.message);
    }
};

const cancelOrderadmin = async (req, res) => {
    try {
        const id = req.query.id;
        const orderId = req.body.orderId;
        const orderData = await Order.findOne({ _id: id });
        if (orderData) {
            if (orderData.status == "placed" || orderData.status == "shipped") {
                for (const product of orderData.products) {
                    const productId = product.productId;
                    const count = product.count;
                    await Product.findByIdAndUpdate(productId, {
                        $inc: { quantity: count },
                    });
                }
                await Order.findByIdAndUpdate(id, { $set: { status: "Cancelled" } });
                res.redirect("/admin/adminOrderList");
            } else {
                await Order.findByIdAndUpdate(id, { $set: { status: "Cancelled" } });
                res.redirect("/admin/adminOrderList");
            }
        } else {
            res.json({ success: false });
        }
    } catch (error) {
        console.log(error.message);
    }
};

// const returnOrder=async(req,res,next)=>
// {
//     // const id=req.query._id;
//     const id=req.body.orderId
//     const orderData=await Order.findById({_id:id})
//     const productId = Product.productId;
//     const count=Product.count
//     if(orderData)
//     {
//         for (const product of orderData.products) {
//             const productId = product.productId;
//             const count = product.count;
//             await Product.findByIdAndUpdate(productId, {
//                 $inc: { quantity: count },
//             });
//         }
//     await Order.findByIdAndUpdate({_id:id},{$set:{status:"returned"}})


// }



// }

const returnOrder = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const orderId = req.body.orderId;
        const orderData = await Order.findOne({ _id: orderId });
        if (orderData) {
            if (orderData.status == "Delivered" || orderData.status == "shipped") {
                for (const product of orderData.products) {
                    const productId = product.productId;
                    const count = product.count;
                    await Product.findByIdAndUpdate(productId, {
                        $inc: { quantity: count },
                    });
                }
                await Order.findByIdAndUpdate(orderId, {
                    $set: { status: "returned" },
                });
                res.json({ success: true });
            } else {
                await Order.findByIdAndUpdate(orderId, {
                    $set: { status: "returned" },
                });
                res.json({ success: true });
            }
        } else {
            res.json({ success: false });
        }
    } catch (error) {
        console.log(error.message);
    }
};

const verifyPayment = async (req, res) => {
    try {
        const details = req.body;
        const crypto = require("crypto");
        let hmac = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET_KEY);
        hmac.update(
            details.payment.razorpay_order_id +
            "|" +
            details.payment.razorpay_payment_id
        );
        hmac = hmac.digest("hex");
        if (hmac == details.payment.razorpay_signature) {
            await Order.findByIdAndUpdate(
                { _id: details.order.receipt },
                { $set: { status: "placed" } }
            );
            await Order.findByIdAndUpdate(
                { _id: details.order.receipt },
                { $set: { paymentId: details.payment.razorpay_payment_id } }
            );
            await Cart.deleteOne({ user: req.session.user_id });
            res.json({ success: true });
        } else {
            await Order.findByIdAndRemove({ _id: details.order.receipt });
            res.json({ success: false });
        }
    } catch (error) {
        console.log(error.message);
        next(error);
    }
    // const totalPrice = req.body.amount2;
    // const total = req.body.amount
};

const loadorderdetails = async (req, res) => {
    try {
        const user = req.session.user_id;
        const orderId = req.query.id;
        const orderData = await Order.findById({ _id: orderId }).populate(
            "products.productId"
        );
        res.render("orderDetails", { orderId, orderData, user });
    } catch (error) {
        console.log(error.message);
    }
};

module.exports = {
    placeOrder,
    loadOrderCompleted,
    orderHistory,
    adminOrderlist,
    showOrderDetails,
    deliveredOrder,
    shippedOrder,
    cancelOrder,
    cancelOrderadmin,
    verifyPayment,
    loadorderdetails,
    salesReport,
    returnOrder
};

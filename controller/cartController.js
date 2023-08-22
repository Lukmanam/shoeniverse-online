const User = require("../model/usermodel");
const Product = require("../model/productModel");
const Cart = require("../model/cartModel");
const Address = require("../model/addressModel");
const Coupon = require("../model/couponModel");

const { query } = require("express");

const loadCart = async (req, res) => {
    try {
        const user = req.session.user_id;
        const id = req.session.user_id;
        const userData = await User.findOne({ _id: id });
        const cartData = await Cart.findOne({ user: id }).populate(
            "products.productId"
        );

        if (req.session.user_id) {
            if (cartData) {
                if (cartData.products.length > 0) {
                    const products = cartData.products;

                    const total = await Cart.aggregate([
                        {
                            $match: {
                                userName: userData.name,
                            },
                        },
                        {
                            $unwind: "$products",
                        },
                        {
                            $project: {
                                productPrice: "$products.productPrice",
                                count: "$products.count",
                            },
                        },
                        {
                            $group: {
                                _id: null,
                                total: { $sum: { $multiply: ["$productPrice", "$count"] } },
                            },
                        },
                    ]);
                    const Total = total[0].total;
                    const userId = userData._id;

                    res.render("cart", {
                        userData,
                        products,
                        Total,
                        userId,
                        user,
                        cartData,
                    });
                } else {
                    res.render("emptyCart", { user, message: "Your Cart is Empty!!" });
                }
            } else {
                res.render("emptyCart", { user, message: "Your Cart is Empty!!" });
            }
        } else {
            res.redirect("/login");
        }
    } catch (error) {
        console.log(error.message);
    }
};

const addToCart = async (req, res) => {
    try {
        const productId = req.query.id;
        const userData = await User.findOne({ _id: req.session.user_id });
        const productData = await Product.findOne({ _id: productId });

        if (req.session.user_id) {
            const userId = req.session.user_id;
            const cartData = await Cart.findOne({ user: userId }).populate(
                "products.productId"
            );
            console.log(cartData);

            if (productData.quantity > 0) {
                if (cartData) {
                    const productExist = cartData.products.find((product) =>
                        product.productId.equals(productId)
                    );

                    if (productExist) {
                        await Cart.updateOne(
                            { user: userId, "products.productId": productId },
                            { $inc: { "products.$.count": 1 } }
                        );
                    } else {
                        await Cart.findOneAndUpdate(
                            { user: userId },
                            {
                                $push: {
                                    products: {
                                        productId: productId,
                                        productPrice: productData.price,
                                    },
                                },
                            }
                        );
                    }
                } else {
                    const cart = new Cart({
                        user: userData._id,
                        userName: userData.name,
                        products: [
                            {
                                productId: productId,
                                productPrice: productData.price,
                            },
                        ],
                    });

                    await cart.save();
                }

                res.redirect("/cart");
            } else {
                res.json({ check: true }); // Not sure what this response is for
            }
        } else {
            res.redirect("/login");
        }
    } catch (error) {
        console.log(error.message);
    }
};

const removeFromCart = async (req, res) => {
    try {
        console.log("Remove from Cart");

        const user = req.session.user_id;
        const productId = req.query.id;
        await Cart.updateOne(
            { user: user },
            { $pull: { products: { productId: productId } } }
        );
        res.redirect("/cart");
    } catch (error) {
        console.log(error.message);
    }
};

const changeQuantity = async (req, res, next) => {
    try {
        const userId = req.body.user;
        const proId = req.body.product;
        let count = req.body.count;
        count = parseInt(count);
        const cartData = await Cart.findOne({ user: userId });
        const [{ count: quantity }] = cartData.products;
        const productData = await Product.findOne({ _id: proId });
        const total = productData.price * (quantity + count);
        if (productData.stock < quantity + count) {
            res.json({ check: true });
        } else {
            res.json({ success: true });
            await Cart.updateOne(
                { user: userId, "products.productId": proId },
                { $inc: { "products.$.count": count } }
            );
        }
    } catch (error) {
        console.log(error.message);
        next(error);
    }
};

// const loadcheckout = async (req, res) => {
//     try {
//       const user=req.session.user_id
//       const userData=User.findOne({_id:req.session.user_id})
//       const addressData=await Address.findOne({userId: req.session.user_id})

//       console.log("This is Address",addressData);

//         if(addressData)
//         {
//             const addresses=addressData.addresses;
//             const total=await Cart.aggregate([
//                 {
//                     $match: {userName: userData.name
//                     }
//                 },
//                 {
//                     $unwind:"$products"
//                 },
//                 {
//                     $project:{
//                         productPrice:"$products.productPrice",
//                         count:"$products.count"
//                     }
//                 },
//                 {
//                     $group:{
//                         _id:null,
//                         total:{$sum:{$multiply:["$productPrice","$count"]}}
//                     }
//                 }
//                 ]);
//                 const Total = total[0].total
//                 res.render('checkout',{ user, addresses, userData, Total });

//         }
//         else{
//             console.log("Address Not Available");
//         }

//     } catch (error) {
//       console.log(error.message);
//     }
//   };
const loadCheckout = async (req, res, next) => {
    try {
        const user = req.session.user_id;
        const userData = await User.findOne({ _id: req.session.user_id });
        const addressData = await Address.findOne({ userId: req.session.user_id });
        const coupon = await Coupon.find({});

        // const wallet = await Wallet.findOne({ userId: req.session.user_id });
        // const coupons = await Coupon.find({ status: true, usedUsers: { $ne: req.session.user_id },expired: { $gte: new Date() } });
        if (addressData) {
            const addresses = addressData.addresses;
            const total = await Cart.aggregate([
                {
                    $match: {
                        userName: userData.name,
                    },
                },
                {
                    $unwind: "$products",
                },
                {
                    $project: {
                        productPrice: "$products.productPrice",
                        count: "$products.count",
                    },
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: { $multiply: ["$productPrice", "$count"] } },
                    },
                },
            ]);
            const Total = total[0].total;
            res.render("checkout", { user, addresses, userData, Total, coupon });
        } else {
            console.log("no address");
        }
    } catch (error) {
        console.log(error.message);
        next(error);
    }
};

module.exports = {
    loadCart,
    addToCart,
    removeFromCart,
    changeQuantity,
    loadCheckout,
};

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
            const cartData = await Cart.findOne({ user: id }).populate("products.productId" )
            .populate('products.productId.offer')

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
        const productData = await Product.findOne({ _id: productId }).populate({path:'offer',$match:{startingDate:{$lte:new Date()},expiryDate:{$gte:new Date()}}})
        
        if(productData.offer){
            var discount = (productData.price * productData.offer.percentage / 100).toFixed(0)
            console.log(discount,"this is discount amount")
            var productPricee=productData.price-discount;
            console.log(productPricee,"this is new price")
          }else{
            var discount=0;
            productPricee=productData.price

          }
        if (req.session.user_id) {
            const userId = req.session.user_id;
            const cartData = await Cart.findOne({ user: userId }).populate(
                "products.productId"
            );
            console.log(cartData);

            if (productData.quantity > 0) {
                console.log(productPricee,"this price is go in to cart")
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
                                        productPrice: productPricee,
                                    },
                                },
                            }
                        );
                    }
                } else {
                    console.log(productPricee,"this price is go in to cart")
                    const cart = new Cart({
                        user: userData._id,
                        userName: userData.name,
                        products: [
                            {
                                productId: productId,
                                productPrice:productPricee
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
        console.log(productData.quantity);
        console.log(count)
        if (productData.quantity < quantity + count) {
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
        const id = req.session.user_id;
        const user = req.session.user_id;
        const userData = await User.findOne({ _id: req.session.user_id });
        const addressData = await Address.findOne({ userId: req.session.user_id });
        const coupon = await Coupon.find({expired : { $gte : new Date() } });
        const cartData = await Cart.findOne({ user: id }).populate("products.productId" )
        .populate('products.productId.offer')
        console.log(cartData.products[0].productId,"this cartdata to Checkout");

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
            res.render("checkout", { user, addresses, userData, Total, coupon,cartData,products:cartData.products });
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

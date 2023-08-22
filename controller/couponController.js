const Coupon = require("../model/couponModel");
const Product = require("../model/productModel");
const cart = require("../model/cartModel");
const User = require("../model/usermodel");

const loadCouponlist = async (req, res) => {
  try {

    const couponList = await Coupon.find({})
    console.log(couponList);
    res.render("couponList", { couponList });
  } catch (error) {
    console.log(error.message);
  }
};

const loadAddcoupon = async (req, res) => {
  try {
    res.render("addCoupon");
  } catch (error) {
    console.log(error.message);
  }
};

const addNewCoupon = async (req, res) => {
  try {
    const {
      couponName,
      discountType,
      discountAmount,
      minCartAmount,
      maxDiscAmount,
      expired,
    } = req.body;
    const couponData = await Coupon.findOne({ name: couponName });
    if (!couponData) {
      const coupon = new Coupon({
        couponName,
        discountType,
        discountAmount,
        minCartAmount,
        maxDiscAmount,
        expired,
      });
      const newCoupon = await coupon.save();
      if (newCoupon) {
        res.redirect("/admin/couponList");
      } else {
        res.render("addCoupon", { message: "try again Failed to add Coupon" });
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};
const loadeditCoupon = async (req, res) => {
  try {
    const id = req.query.coupon
    const coupon = await Coupon.findOne({ _id: id })
    res.render('editCoupon', { coupon })
  }
  catch (error) {
    console.log(error.message);
  }
}

const editCoupon = async (req, res) => {
  // try {
  //   const couponId=req.query.id;
  //   const updatedCoupon=await Coupon.findByIdAndUpdate(couponId,{$set:req.body});
  //   if(updatedCoupon)
  //   {
  //     res.redirect('/admin/couponList')
  //   }

  // } catch (error) {
  //     console.log(error.message);
  // }

  try {
    const orderId = req.query.id;
    // const { couponName, discountType, discountAmount, minCartAmount, maxDiscAmount, expired } = req.body
    const updatedData = await Coupon.findByIdAndUpdate(orderId, { $set: req.body });
    if (updatedData) {
      res.redirect('/admin/couponList')
    }

  } catch (error) {
    console.log(error.message);
    next(error);
  }
}

const applycoupon = async (req, res) => {
  try {
    console.log("applying Coupon");
    const code = req.body.code
    const amount = Number(req.body.amount)
    const userExist = await Coupon.findOne({ couponName: code, usedUsers: { $in: [req.session.user_id] } });
    if (userExist) {
      res.json({ user: true })
    }
    else {

      const couponData = await Coupon.findOne({ couponName: code });
      if (couponData) {
        if (couponData.status == false) {
          res.json({ status: true });
        } else {
          if (couponData.expired <= new Date()) {
            res.json({ date: true });
          } else {
            if (couponData.minCartAmount >= amount) {
              res.json({ cartAmount: true });
            } else {
              // await Coupon.findByIdAndUpdate(couponData._id, { $push: { usedUsers: req.session.user_id }});
              if (couponData.discountType == "Fixed Amount") {
                const discAmount = couponData.discountAmount;
                const disTotal = Math.round(amount - discAmount);

                return res.json({ amountkey: true, discAmount, disTotal })
              } else {
                const perAmount = (amount * couponData.discountAmount) / 100;
                if (perAmount <= couponData.maxDiscAmount) {
                  const discAmount = perAmount;
                  const disTotal = Math.round(amount - discAmount);
                  return res.json({ amountKey: true, discAmount, disTotal });

                } else {
                  const discAmount = couponData.maxDiscAmount;
                  const disTotal = Math.round(amount - discAmount);
                  return res.json({ amountKey: true, discAmount, disTotal });
                }
              }
            }

          }
        }
      } else {
        res.json({ invalid: true });
      }
      // const couponData=await Coupon.findOne({couponName:code})
      // if(couponData){
      //     await Coupon.
      // }
    }


  } catch (error) {
    console.log(error.message);

  }
}

module.exports = {
  loadCouponlist,
  loadAddcoupon,
  addNewCoupon,
  loadeditCoupon,
  applycoupon,
  editCoupon
};

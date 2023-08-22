const mongoose = require("mongoose");
const couponSchema = new mongoose.Schema({
    couponName: {
        type: String,
        required: true,
    },
    discountType: {
        type: String,
        required: true,
    },
    discountAmount: {
        type: Number,
        required: true,
    },
    minCartAmount: {
        type: Number,
        required: true,
    },
    maxDiscAmount: {
        type: Number,
        required: true,
    },
    usedUsers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
        },
    ],
    status: {
        type: Boolean,
        default: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    expired: {
        type: Date,
        required: true,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});
const couponModel = mongoose.model("coupon", couponSchema);
module.exports = couponModel;

const order = require("../model/orderModel");

//Finding the total Amount of the sales

const totalRevenue = async () => {
    const revenue = await order.aggregate([
        {
            $match: { status: { $ne: "pending" } },
        },
        {
            $group: {
                _id: null,
                revenue: { $sum: "$totalAmount" },
            },
        },
    ]);

    const totalRevenue = revenue.length > 0 ? revenue[0].revenue : 0;
    return totalRevenue;
};

const paymentMethod = async () => {
    const totalPayment = await order.aggregate([
        {
            $match: { status: { $ne: "pending" } },
        },
        {
            $group: {
                _id: "$paymentMethod",
                amount: { $sum: "$totalAmount" },
            },
        },
    ]);
    console.log(totalPayment);
    const result = totalPayment.length > 0 ? totalPayment : 0;
    return result;
};

const dailyChart = async () => {
    const dailyOrder = await order.aggregate([
        {
            $match: { status: { $ne: "pending" } },
        },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                dailyRevenue: { $sum: "$totalAmount" },
            },
        },
        {
            $sort: { _id: 1 },
        },
        {
            $limit: 14,
        },
    ]);
    const result = dailyOrder || 0;
    return result;
};
const monthlyTotalRevenue = async (currMonthStartDate, now) => {
    const monthlyToatalRevenue = await order.aggregate([
        {
            $match: {
                date: {
                    $gt: currMonthStartDate,
                    $lt: now,
                },
                status: {
                    $ne: "pending",
                },
            },
        },
        {
            $group: {
                _id: null,
                monthlyToatalRevenue: {
                    $sum: "$totalAmount",
                },
            },
        },
    ]);
    const result =
        monthlyToatalRevenue.length > 0
            ? monthlyToatalRevenue[0].monthlyToatalRevenue
            : 0;
    return result;
};

module.exports = {
    totalRevenue,
    // monthlyRevenue
    monthlyTotalRevenue,
    dailyChart,
    paymentMethod,
};

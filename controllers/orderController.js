const Order = require('../models/order')
const Product = require('../models/product')
const BigPromise = require('../middlewares/bigPromise');
const CustomError = require('../utils/customError');

exports.createOrder = BigPromise( async (req,res,next) => {
    const {
        shippingInfo,
        orderItems,
        paymentInfo,
        taxAmount,
        shippingAmount,
        totalAmount,

    } = req.body;

    const order = await Order.create({
        shippingInfo,
        orderItems,
        paymentInfo,
        taxAmount,
        shippingAmount,
        totalAmount,
        user:req.user._id
    })

    res.status(200).json({
        success:true,
        order
    })


})

exports.getOneOrder = BigPromise( async (req,res,next) => {
    const order = await Order.findById(req.params.id).populate('user','name email')

    if(!order){
        return next(new CustomError("please check order id",401))
    }

    res.status(200).json({
        success:true,
        order
    })
})

exports.getLoggedInOrders = BigPromise( async (req,res,next) => {
    const orders = await Order.find({user:req.user._id})

    if(!orders){
        return next(new CustomError("no orders",401));
    }

    res.status(200).json({
        success:true,
        orders
    })
})

// admin controllers
exports.adminGetAllOrders = BigPromise( async (req,res,next) => {
    const orders = await Order.find().populate('user','name email');

    res.status(200).json({
        success:true,
        orders
    })
})

exports.adminUpdateOrder = BigPromise( async (req,res,next) => {
    const order = Order.findById(req.params.id);
    
    if(order.orderStatus === "delivered"){
        return next(new CustomError("Order is already marked as delivered!",401))
    }

    order.orderStatus = req.body.orderStatus;

    order.orderItems.forEach(async prod => {
        await updateProductStock(prod.product,prod.quantity)
    })

    await order.save()

    res.status(200).json({
        success:true,
        order
    })
})

exports.adminDeleteOrder = BigPromise(async (req,res,next) => {
    const order = await Order.findById(req.params.id);

    if(!order){
        return next(new CustomError("Order doesn't exist!",401))
    }

    await order.remove();

    res.status(200).json({
        success:true,
        message:"Order was deleted successfully!"
    })
})

async function updateProductStock(productId,quantity){
    const product = await Product.findById(productId)

    product.stock = product.stock - quantity;

    await product.save({validateBeforeSave:false})
}
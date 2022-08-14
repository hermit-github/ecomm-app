const Product = require('../models/product');
const BigPromise = require("../middlewares/bigPromise");
const CustomeError = require("../utils/customError")
const fileUpload = require('express-fileupload');
const cloudinary = require('cloudinary');
const WhereClause = require('../utils/whereClause');
const CustomError = require('../utils/customError');





exports.testProductRoute = (req,res,next) => {
    res.status(200).json({
        success:true,
        message:"You are in the product route"
    })
}

exports.addProduct = BigPromise(async (req,res,next) => {

    // images
    let imageArray = []

    if(!req.files){
        return next(new CustomeError("Images are required!",401))
    }

    if(req.files){
        for(let index=0;index<req.files.photos.length;index++){
            let result = await cloudinary.v2.uploader.upload(
                req.files.photos[index].tempFilePath,
                {
                    folder:"products"
                }
            );
            imageArray.push({
                id:result.public_id,
                secure_url:result.secure_url
            });
        };
    }

    req.body.photos = imageArray;
    req.body.user = req.user.id;

    const product = await Product.create(req.body);

    res.status(200).json({
        success:true,
        product
    })
})

exports.getAllProducts = BigPromise(async (req,res,next) => {


    const resultPerPage = 6;
    const totalProductCount = await Product.countDocuments();


    const productObj = new WhereClause(Product.find(),req.query).search().filter()
    let products = await productObj.base;

    const filteredProductNumber = products.length;

    productObj.pager()
    products = await productObj.base.clone();

    res.status(200).json({
        success:true,
        products,
        filteredProductNumber,
        totalProductCount
    })
})

exports.getOneProduct = BigPromise(async (req,res,next) => {
    const product = await Product.findById(req.params.id);

    if(!product){
        return next(new CustomeError("Product not found!",401));
    }

    res.status(200).json({
        success:true,
        product
    })
})

exports.addReview = BigPromise( async (req,res,next) => {
    const {rating,comment,productId} = req.body;

    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment
    }

    const product = await Product.findById(productId);

    if(!product){
        return next( new CustomError("Product doesn't exist!",401));
    }

    const hasAlreadyReviewed = product.reviews.find(
         review => review.user.toString() === req.user._id
         )

    if(hasAlreadyReviewed){
        product.reviews.forEach( review => {
            if(review.user.toString() === req.user._id){
                review.comment = comment;
                review.rating = rating;
            }
        })
    } else {
        product.reviews.push(review)
        product.numberOfReviews = product.reviews.length;
    }

    // adjust average ratings
    product.ratings = product.reviews.reduce((acc,item) => item.rating + acc,0)/product.reviews.length;

    await product.save({validateBeforeSave:true})

    res.status(200).json({
        success:true
    })

})

exports.deleteReview = BigPromise( async (req,res,next) => {
    const {productId} = req.query;

    const product = await Product.findById(productId);

    if(!product){
        return next( new CustomError("Product not found!",401));
    }

    const reviews = product.reviews.filter( review => review.user.toString() === req.user._id);

    const numberOfReviews = reviews.length;

    const ratings = reviews.reduce((acc,item) => item.rating + acc,0)/product.reviews.length;

    // instead of save use update method cause there might be a lot of reviews
    await Product.findByIdAndUpdate(productId,{
        reviews,
        ratings,
        numberOfReviews
    },{
        new:true,
        runValidators:true,
        useFindAndModify:false
    })

    res.status(200).json({
        success:true
    })

})

exports.getReviewsForOneProduct = BigPromise( async (req,res,next) => {
    const product = await Product.findById(req.query.id);

    if(!product){
        return next(new CustomError("Product doesn't exist",401))
    }

    res.status(200).json({
        success:true,
        product_name:product.name,
        product_category:product.category,
        product_brand:product.brand,
        reviews:product.reviews
    })
})


// admin only controllers
exports.adminGetAllProducts = BigPromise( async (req,res,next) => {
    const products = await Product.find({})

    res.status(200).json({
        success:true,
        products
    })
})

exports.adminUpdateOneProduct = BigPromise(async (req,res,next) => {
    let product = await Product.findById(req.params.id);

    if(!product){
        return next( new CustomeError("Product Not Fount",401));
    }

    let imagesArray = []

    if(req.files){

        // destroy the existing images
        for(let index=0;index<product.photos.length;index++){
            const result = cloudinary.v2.uploader.destroy(
                product.photos[index].id
                )
        }

        //upload new images
        for(let index=0;index<req.files.photos.length;index++){
            let result = await cloudinary.v2.uploader.upload(
                req.files.photos[index].tempFilePath,
                {
                    folder:"products" // folder name -> .env
                }
            );
            imagesArray.push({
                id:result.public_id,
                secure_url:result.secure_url
            });
        };
    }

    if(imagesArray.length !== 0 ){
        req.body.photos = imagesArray;
    }

    product = await Product.findByIdAndUpdate(req.params.id,req.body,{
        new:true,
        runValidators:true,
        useFindAndModify:true
    })

    res.status(200).json({
        success:true,
        product
    })
})

exports.adminDeleteOneProduct = BigPromise(async (req,res,next) => {
    const product = await Product.findById(req.params.id);

    if(!product){
        return next(new CustomeError("Product Not found",401));
    }

    // destroy the existing images
    for(let index=0;index<product.photos.length;index++){
        const result = cloudinary.v2.uploader.destroy(
            product.photos[index].id
            )
    }

    await product.remove()

    res.status(200).json({
        success:true,
        message:"Product was deleted!"
    })
})
const Product = require('../models/product');
const BigPromise = require("../middlewares/bigPromise");
const CustomeError = require("../utils/customError")
const fileUpload = require('express-fileupload');
const cloudinary = require('cloudinary');





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
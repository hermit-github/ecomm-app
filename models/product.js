const mongoose = require('mongoose')
const validator = require('validator')

const productSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Please provide product name"],
        trim:true,
        maxLength:[120,"Product name shouldn't be more than 120 characters"]
    },
    price:{
        type:Number,
        required:[true,"Please provide product price"],
        maxLength:[5,"Product price shouldn't be more than 5 digits"]
    },
    description:{
        type:String,
        required:[true,"Please provide product description"]
    },
    photos:[
        {
            id : {
                type:String,
                required:true
            },
            secure_url : {
                type:String,
                required:true
            }
        }
    ],
    category:{
        type:String,
        required:[true,"please select product category"],
        enum:{
            values:[
                'shortsleeves',
                'longsleeves',
                'sweatshirt',
                'hoodies'
            ],
            message: 'please select category only from the once provided!'
        }
    },
    brand:{
        type:String,
        required:[true,"please add a brand for clothing"]
    },
    ratings:{
        type:Number,
        default:0
    },
    numberOfReviews:{
        type:Number,
        default:0
    },
    reviews:[
        {
            user:{
                type:mongoose.Schema.ObjectId,
                ref:'User',
                required:true
            },
            name:{
                type:String,
                required:true
            },
            rating:{
                type:Number,
                required:true
            },
            comment:{
                type:String,
                required:true
            }
        }
    ],
    user:{
        type:mongoose.Schema.ObjectId,
        ref:'User',
        required:true
    },
    createdAt:{
        type:Date,
        default:Date.now,
    }
});

const Product = mongoose.model('Product',productSchema);

module.exports = Product;
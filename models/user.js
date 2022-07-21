const mongoose  = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,'Please provide a name'],
        maxlength:[40,'Name should atleast be 40 characters.'],
    },
    email:{
        type:String,
        required:[true,'Please provide an email'],
        validate:[validator.isEmail,'Please provide a valid email.'],
        unique:[true,'Account with this email id already exists.']
    },
    password:{
        type:String,
        required:[true,'Please provide a password'],
        minlength:[6,'Passwrod should atleast be 6 characters long.'],
        select:false
    },
    role:{
        type:String,
        default:'user'
    },
    photo:{
        id:{
            type:String,
            required:true
        },
        secure_url:{
            type:String,
            required:true
        }
    },
    forgotPasswordToken: String,
    forgotPasswordExpiry: Date,
    createdAt: {
        type:Date,
        default: Date.now
    }

})

// encrypt password before save
userSchema.pre('save', function(next){
    if(!this.isModified('password')){
        return next();
    }
    this.password = await bcrypt.hash(this.password,10)
})

// validate passwrod sent by user
userSchema.methods.isValidPassword = async function(userSentPassword){
    return await bcrypt.compare(userSentPassword,this.password);
}

// create and return jwt token
userSchema.methods.createJwtToken = function() {
    return jwt.sign({id:this._id},process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_EXPIRY,
    });
} 

// generate forgot password token (string)
userSchema.methods.getForgotPasswordToken = function() {
    // generate a long random string
    const forgotToken = crypto.randomBytes(20).toString('hex');
    
    // generate a hash - make sure to hash it on backend
    this.forgotPasswordToken = crypto
        .createHash('sha256')
        .update(forgotToken)
        .digest('hex')

    // time of token
    this.forgotPasswordExpiry = Date.now() + process.env.FORGOT_PASSWORD_EXPIRY;

    return forgotToken;
}

const User = mongoose.model('User',userSchema);

module.exports = User;
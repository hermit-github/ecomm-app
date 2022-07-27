const User = require('../models/user')
const BigPromise = require('../middlewares/bigPromise')
const CustomError = require('../utils/customError');
const cookieToken = require('../utils/cookieToken');
const fileUpload = require('express-fileupload');
const cloudinary = require('cloudinary');
const mailHelper = require('../utils/mailHelper');
const crypto = require('crypto');





exports.signup = BigPromise(async (req, res, next) => {
    //let result;
    console.log(req.body);
    if (!req.files) {
      return next(new CustomError("photo is required for signup", 400));
    }
  
    const { name, email, password } = req.body;
  
    if (!email || !name || !password) {
      return next(new CustomError("Name, email and password are required", 400));
    }
  
    let file = req.files.photo;
  
    const result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
      folder: "users",
      width: 150,
      crop: "scale",
    });
  
    const user = await User.create({
      name,
      email,
      password,
      photo: {
        id: result.public_id,
        secure_url: result.secure_url,
      },
    });
  
    cookieToken(user, res);
  });

exports.login = BigPromise( async (req,res,next) => {
  const {email,password} = req.body;

  // check presence of email or password in req body
  if(!email || !password){
    return next(new CustomError('Please provide email and password',400))
  }

  // getting user from db
  const user = await User.findOne({email}).select("+password")

  // if user doesn't exist in db
  if(!user){
    return next(new CustomError("You are not registered!",400))
  }

  // check if password sent by user is correct
  const isCorrectPassword = user.isValidPassword(password);
  
  // if password sent by user in incorrect
  if(!isCorrectPassword){
    return next(new CustomError("Email or password doesn't match or exist!",400));
  }

  // all good! generate token and send to user
  cookieToken(user,res)

})

exports.logout = BigPromise( async (req,res,next) => {
  res.cookie('token',null,{
    expires: new Date(Date.now()),
    httpOnly:true
  })
  res.status(200).json({
    success:true,
    message:"Successfully logged out"
  })
})

exports.forgotPassword = BigPromise( async (req,res,next) => {
  const {email} = req.body;

  const user = await User.findOne({email})

  if(!user){
    return next(new CustomError("Email not registered",400))
  }

  const forgotToken = user.getForgotPasswordToken();

  await user.save({validateBeforeSave:false})

  const myUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${forgotToken}`

  const message = `Copy & Paste the url in you browser\n\n${myUrl}`

  try {
    await mailHelper({
      email:user.email,
      subject:"Password Reset Email - LCO Tshirt Store",
      message:message
    })
    
    res.status(200).json({
      success:true,
      message:"Email sent successfully!"
    })
  } catch (error) {
    user.forgotPasswordToken = undefined
    user.forgotPasswordExpiry = undefined
    await user.save({validateBeforeSave:false})

    return next(new CustomError(error.message,500))
  }
})

exports.passwordReset = BigPromise( async (req,res,next) => {
  const token = req.params.token;

  const encryptedToken = crypto
  .createHash('sha256')
  .update(token)
  .digest('hex')

  const user = await User.findOne({
    encryptedToken,
    forgotPasswordExpiry:{$gt:Date.now()}
  })

  if(!user){
    return next(new CustomError("Token is invalid or expired",400))
  }

  if(req.body.password !== req.body.confirmPassword){
    return next(new CustomError("Password and Confirm Password don't match"))
  }

  user.password = req.body.password;
  user.forgotPasswordToken = undefined;
  user.forgotPasswordExpiry = undefined; 

  await user.save();

  // send a JSON response or send token
  cookieToken(user,res);

})

exports.getLoggedInUserDetails = BigPromise(async (req,res,next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success:true,
    user
  })
})
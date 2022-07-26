const app = require('./app');
const dbConnect = require('./config/db');
const cloudinary = require('cloudinary')


// Connect with Database
dbConnect()

// cloudinary config 
cloudinary.config({
  cloud_name:process.env.CLOUDINARY_NAME,
  api_key:process.env.CLOUDINARY_API_KEY,
  api_secret:process.env.CLOUDINARY_API_SECRET
})



app.listen(process.env.PORT, () => {
  console.log(`Listening on port ${process.env.PORT}`);
});

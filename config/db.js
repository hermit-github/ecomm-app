const mongoose = require('mongoose')

const dbConnect = () => {

    mongoose.connect(process.env.DB_URL,{
        useNewUrlParser:true,
        useUnifiedTopology:true,
    })
    .then(console.log(`Connected to mongodb!`))
    .catch(error => {
        console.error(`DB connection issues`);
        console.error(error);
        process.exit(1)
    })
}

module.exports = dbConnect
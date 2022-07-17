const BigPromise = require('../middlewares/bigPromise')

exports.home = BigPromise((req,res) => {
    res.status(200).json({
        success:true,
        greeting:"Hello from API."
    })
})

exports.homeDummy = (req,res) => {
    
    res.status(200).json({
        success:true,
        greeting:"Dummy api call."
    })
}
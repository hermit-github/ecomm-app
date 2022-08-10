const express = require('express')
const router = express.Router()
const { isLoggedIn, customRole } = require('../middlewares/user');
const { testProductRoute } = require('../controllers/productController')


router.route('/testProduct').get(testProductRoute)

module.exports = router
const express = require('express')
const router = express.Router()
const { isLoggedIn, customRole } = require('../middlewares/user');
const { addProduct,
    getAllProducts,
    testProductRoute } = require('../controllers/productController');


// user routes
router.route('/testProduct').get(testProductRoute);
router.route('/products').get(getAllProducts);


// admin routes
router.route('/admin/product/add').post(isLoggedIn,customRole('admin'),addProduct)

module.exports = router
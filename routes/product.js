const express = require('express')
const router = express.Router()
const { isLoggedIn, customRole } = require('../middlewares/user');
const { addProduct,
    getAllProducts,
    getOneProduct,
    addReview,
    deleteReview,
    getReviewsForOneProduct,
    adminGetAllProducts,
    adminUpdateOneProduct,
    adminDeleteOneProduct,
    testProductRoute } = require('../controllers/productController');


// user routes
router.route('/testProduct').get(testProductRoute);
router.route('/products').get(getAllProducts);
router.route('/product/:id').get(getOneProduct);
router.route('/review')
    .delete(isLoggedIn,deleteReview)
    .put(isLoggedIn,addReview)
router.route('/reviews').get(isLoggedIn,getReviewsForOneProduct)


// admin routes
router.route('/admin/product/add').post(isLoggedIn,customRole('admin'),addProduct)
router.route('/admin/products').get(isLoggedIn,customRole('admin'),adminGetAllProducts)
router
    .route('/admin/product/:id')
    .put(isLoggedIn,customRole('admin'),adminUpdateOneProduct)
    .delete(isLoggedIn,customRole("admin"),adminDeleteOneProduct)



module.exports = router
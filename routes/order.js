const express = require('express')
const router = express.Router()
const {isLoggedIn , customRole} = require("../middlewares/user")
const {
    createOrder,
    getOneOrder,
    getLoggedInOrders,
    adminGetAllOrders,
    adminUpdateOrder,
    adminDeleteOrder
} = require("../controllers/orderController")


router.route("/order/create").post(isLoggedIn,createOrder);
router.route("/order/myorders").get(isLoggedIn,getLoggedInOrders)
router.route("/order/:id").get(isLoggedIn,getOneOrder)

// admin routes
router
    .route("/admin/orders")
    .get(isLoggedIn,customRole("admin"),adminGetAllOrders)

router
    .route("/admin/orders")
    .put(isLoggedIn,customRole("admin"),adminUpdateOrder)
    .delete(isLoggedIn,customRole("admin"),adminDeleteOrder)



module.exports = router;
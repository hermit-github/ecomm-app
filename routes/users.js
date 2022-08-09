const express = require('express')
const router = express.Router()



const {signup,
        login,
        logout,
        forgotPassword,
        passwordReset,
        getLoggedInUserDetails,
        changePassword,
        updateUserDetails,
        managerGetAllUsers,
        adminGetOneUser,
        adminUpdateOneUser,
        adminDeleteOneUser,
        adminGetAllUsers} = require('../controllers/userController')
const { isLoggedIn, customRole } = require('../middlewares/user');

router.route('/signup').post(signup)
router.route('/login').post(login)
router.route('/logout').get(logout)
router.route('/forgotPassword').post(forgotPassword)
router.route('/password/reset/:token').post(passwordReset)
router.route('/userdashboard').get(isLoggedIn,getLoggedInUserDetails)
router.route('/password/update').post(isLoggedIn,changePassword)
router.route('/userdashboard/update').post(isLoggedIn,updateUserDetails)

// admin routes
router.route('/admin/users').get(isLoggedIn,customRole('admin'),adminGetAllUsers)
router
   .route('/admin/users/:id')
   .get(isLoggedIn,customRole('admin'),adminGetOneUser)
   .put(isLoggedIn,customRole('admin'),adminUpdateOneUser)
   .delete(isLoggedIn,customRole('admin'),adminDeleteOneUser)

// manager routes
router.route('/manager/users').get(isLoggedIn,customRole('manager'),managerGetAllUsers)


module.exports = router;
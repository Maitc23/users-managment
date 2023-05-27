const router = require('express').Router(); 
const {getUserById, updateUser, deleteUser, getUsers} = require('../controllers/users')
const uploadFile = require('../middlewares/uploadFile'); 
const verifyToken = require('../middlewares/verifyToken');

//Routes of the user module
router.route('/user/:_id')
    .get(verifyToken, getUserById)
    .put(verifyToken, uploadFile, updateUser)
    .delete(verifyToken, deleteUser)

router.route("/users")
    .get(verifyToken, getUsers)


module.exports = router
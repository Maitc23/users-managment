const router = require('express').Router();
const {login, register, me, tokenIsValid} = require('../controllers/auth'); 
const verifyToken = require('../middlewares/verifyToken');
const uploadFile = require('../middlewares/uploadFile'); 

router.route('/register')
    .post(uploadFile,register)

router.route('/login')
    .post(login)


router.route('/me')
    .get(verifyToken, me);

router.route('/tokenIsValid')
    .post(tokenIsValid)

    

module.exports = router
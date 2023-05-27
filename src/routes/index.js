const router = require('express').Router(); 
const authRoutes = require('./auth');
const usersRoutes = require('./users');
const questionsRoutes = require('./questions');

//Routes of the proyect 
router.use('/auth', authRoutes);
router.use('/', usersRoutes);
router.use('/', questionsRoutes);
module.exports = router; 
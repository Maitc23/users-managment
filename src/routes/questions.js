const router = require('express').Router();
//Controllers
const {  createQuestion, getAllQuestions, getQuestionById, updateQuestion, deleteQuestion, getQuestionsByUser  } = require('../controllers/questions');
const verifyToken = require('../middlewares/verifyToken');

router.route('/question/:_id')
    .get(verifyToken,  getQuestionById)
    .put(verifyToken, updateQuestion)
    .delete(verifyToken, deleteQuestion)

 
router.route('/questions')
    .post(verifyToken, createQuestion)
    .get(verifyToken, getAllQuestions)


router.route('/questions/user/:_id')
    .get(verifyToken, getQuestionsByUser)
    


module.exports = router;
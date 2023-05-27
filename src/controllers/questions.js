const controller = {};
//Models 
const Question = require("../models/questions");
const User = require("../models/users");
//Utils
const { createChatCompletion } = require("../utils/chatgpt.messages");

//Function to register question 
controller.createQuestion = async (req, res) => {
    try {
        const { title, content} = req.body;

        //We check if the user send the title and the content
        if (!title || !content) return res.status(400).json({ error: 'Campos vacios', sucess: false });

        //We check the length of the title
        if (title.length < 3) return res.status(400).json({ error: 'El titulo debe ser de 3 caracteres minimo', sucess: false });

        //We check the length of the content
        if (content.length < 3) return res.status(400).json({ error: 'El contenido debe ser de 3 caracteres minimo', sucess: false });

        //We get the author (user) of the question 
        const user = await User.findById(req.userId);

        //We check if the user exist
        if (!user) return res.status(400).json({ error: 'Usuario no encontrado', sucess: false });

        //We create the question
        const question = new Question({
            title,
            content
        });

        //We save the question on the database
        await question.save();

        //We create the response of the question with the OpenAI API
        const qestion_response = await createChatCompletion(content, 'user', 0.6);

        //We save the response on the database
        question.response = qestion_response.data.choices[0].message.content;
        await question.save();

        //We get the last question created
        const lastQuestion = await Question.findOne().sort({ _id: -1 }).limit(1);

        //We add the question to the user
        user.questions.push(lastQuestion._id);
        await user.save();

        //We send the response
        return res.status(200).json({ question, message: "Pregunta creada y respondida" });

    } catch (err) {
        res.status(err.status ? err.status : 500).send({ error: err, success: false });
    }
}

//Function to get all questions
controller.getAllQuestions = async (req, res) => {
    try {
        //We get all the questions
        const questions = await Question.find();

        //We check if there are questions
        if (!questions) return res.status(400).json({ error: 'No hay preguntas', sucess: false });

        //We send the response
        return res.status(200).json({ questions, message: "Preguntas obtenidas", success: true });

    } catch (err) {
        res.status(err.status ? err.status : 500).send({ error: err, success: false });
    }
}

//Function to get a question by id
controller.getQuestionById = async (req, res) => {
    try {
        //We get the question id
        const question_id = req.params;

        //We check if the question id exist
        if (!question_id) return res.status(400).json({ error: 'Campos vacios', sucess: false });

        //We get the question
        const question = await Question.findById(question_id);

        //We check if the question exist
        if (!question) return res.status(400).json({ error: 'Pregunta no encontrada', sucess: false });

        //We send the response
        return res.status(200).json({ question, message: "Pregunta obtenida", success: true });

    } catch (err) {
        res.status(err.status ? err.status : 500).send({ error: err, success: false });
    }
}

//Function to update a question
controller.updateQuestion = async (req, res) => {
    try {
        //We get the question id
        const question_id = req.params;

        //We get the new title and content
        let { title, content } = req.body;

        //We check if the question id exist
        if (!question_id) return res.status(400).json({ error: 'Campos vacios', sucess: false });

        //We get the question
        const question = await Question.findById(question_id);

        //We check if the question exist
        if (!question) return res.status(400).json({ error: 'Pregunta no encontrada', sucess: false });

        //We update the question
        if (!title) title = question.title;
        if (!content) {
            content = question.content
        } else {
            //We create the response of the question with the OpenAI API
            const qestion_response = await createChatCompletion(content, 'user', 0.6);
            content = qestion_response.data.choices[0].message.content;
            //We save the response on the database
            question.response = content;
        }
        //We update the question
        question.title = title;
        question.content = content;

        //We save the question on the database
        await question.save();

        //We send the response
        return res.status(200).json({ question, message: "Pregunta actualizada", success: true });

    } catch (err) {
        res.status(err.status ? err.status : 500).send({ error: err, success: false });
    }
}

//Function to delete a question
controller.deleteQuestion = async (req, res) => {
    try {
        //We get the question id
        const question_id = req.params;

        //We check if the question id exist
        if (!question_id) return res.status(400).json({ error: 'Campos vacios', sucess: false });

        //We get the question to delete
        await Question.findByIdAndDelete(question_id);

        //We send the response
        return res.status(200).json({ message: "Pregunta eliminada", success: true });

    } catch (err) {
        res.status(err.status ? err.status : 500).send({ error: err, success: false });
    }
}

//Function to get all questions of a user
controller.getQuestionsByUser = async (req, res) => {
    try {
        //We get the user id
        const user_id = req.params;

        //We check if the user id exist
        if (!user_id) return res.status(400).json({ error: 'Campos vacios', sucess: false });

        //We get the user
        const user = await User.findById(user_id).populate({ path: 'questions' });

        //We check if the user exist
        if (!user) return res.status(400).json({ error: 'Usuario no encontrado', sucess: false });

        //We send the response
        return res.status(200).json({ questions: user.questions, message: "Preguntas obtenidas", success: true });

    } catch (err) {
        res.status(err.status ? err.status : 500).send({ error: err, success: false });
    }
}
module.exports = controller;
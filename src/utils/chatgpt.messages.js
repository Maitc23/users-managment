//Config
const openai = require('../config/chatgpt.config');

//Function to create a chat completion with the OpenAI API
const createChatCompletion = (message, role, temperature) => {
    return new Promise(async (resolve, reject) => {
        try {
            const completion = await openai.createChatCompletion({
                model: 'gpt-3.5-turbo',
                messages: [{ role: role, content: message }],
                temperature: temperature,
                max_tokens: 2048,
                presence_penalty: 0.6
            });
            resolve(completion)
        } catch (err) {
            console.log(err);
            reject(err)
        }
    })
}


module.exports = {
    createChatCompletion
}
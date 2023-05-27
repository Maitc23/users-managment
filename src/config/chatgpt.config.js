const { Configuration, OpenAIApi } = require('openai'); 
//Config of the OpenAI API
const config = new Configuration({
    organization: process.env.OPENAI_ORGANIZATION_ID, 
    apiKey: process.env.OPENAI_API_KEY
}); 

//Instance of the OpenAI API
const openai = new OpenAIApi(config); 


module.exports = openai; 
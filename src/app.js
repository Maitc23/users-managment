const express = require('express');
const cors = require('cors');
const app = express();


//Setings 
app.set('port', process.env.PORT || 8080);


//Middlewares 
app.use(cors()); 


app.use(express.json());
//Routes 
app.use('/api', require('./routes'));


module.exports = app; 
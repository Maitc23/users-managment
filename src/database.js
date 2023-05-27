const mongoose = require('mongoose');

//We pass the conection of the BD 
const URI = process.env.MONGOD_URI
    ? process.env.MONGOD_URI
    : 'mongodb://localhost/usersdb';

mongoose.connect(URI);


const conection = mongoose.connection;

//Conection 
conection.once('open', ()=> { 
    console.log('DB is connected on: '+ URI );
}); 
require('dotenv').config(); 
const app = require('./app'); 
require('./database'); 

//Funcion que inicia el servidor backend 
async function main () {
    await app.listen(app.get('port')); 
    console.log('Server on port: ' + app.get('port')); 
}

//Arrancamos el server
main(); 
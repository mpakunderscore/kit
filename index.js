//SERVER

let express = require('express');
let path = require('path');

let app = express();

//STATIC WEB
app.use(express.static(path.join(__dirname, 'web')));

let server = require('http').Server(app);

const port = process.env.PORT || 3030;

server.listen(port);

// require('dotenv').config({path: __dirname + '/.env'})

let test = process.env.TEST;
console.log(test);

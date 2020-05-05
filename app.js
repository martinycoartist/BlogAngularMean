'use strict'

//Cargar modulos de node para crear el servidor

var express = require('express');
var bodyParser =require('body-parser');
var path = require('path');




//Ejecutar express (http)

var app = express();

//cargar ficheros rutase

var article_routes = require('./routes/article');

//Middlewares

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

//CORS 

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});


// añadir prefijos a las rutas / cargar rutas
app.use('/', express.static('client', {redirect: false}));
app.use('/api',article_routes);

app.get('*' , function(req, res, next){
	res.sendFile(path.resolve('client/index.html'));
});


//Exportar modulo (fichero actual)
module.exports = app;
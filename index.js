'use strict'

var mongoose=require('mongoose');
var app = require('./app');
var port = 3900;


mongoose.Promise = global.Promise;
mongoose.set('useFindAndModify', false);

mongoose.connect('mongodb://localhost:27017/apirestblog', { useNewUrlParser: true, useUnifiedTopology: true})
        .then(() => {
            console.log('la conexion se ha realizado ok');

            //crear servidor y escuchar peticiones http
            app.listen(port, ()=>{
                console.log('servidor en localhost: '+port);
            });

        });
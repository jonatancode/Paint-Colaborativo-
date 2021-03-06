var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var mongoose = require('mongoose');

//mongoose.connect('mongodb://localhost/pinceladas');
mongoose.Promise = global.Promise;

mongoose.connect("mongodb://ucmjyz7azolvkxk:gAqIh8CH8vldElz5JNmn@bgmltwkobgfjgr1-mongodb.services.clever-cloud.com:27017/bgmltwkobgfjgr1");

var app = express();
require('./routes/io/index')(app);



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/socket.io/socket.io.js',   express.static(__dirname + '/node_modules/socket.io-client/dist/socket.io.js'));
app.use('/jquery',   express.static(__dirname + '/node_modules/jquery/dist/jquery.min.js'));
//app.use('/images',   express.static(__dirname + '/imagenes/'));


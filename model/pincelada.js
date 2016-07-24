var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var pinceladas = new Schema({
	color : String,
	tamano : Number,
	coordenadas : []

})

var obj = mongoose.model('pincelada', pinceladas);

module.exports = obj;
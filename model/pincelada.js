var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var pinceladas = new Schema({
	color : String,
	tamano : Number,
	ejex : Number,
	ejey : Number

})

var obj = mongoose.model('bgmltwkobgfjgr1', pinceladas);
//var obj = mongoose.model('pincelada', pinceladas);

module.exports = obj;
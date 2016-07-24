var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var imagenes = new Schema({
	imagen : Buffer,
	coordenadas : [],
	nombre : String

})

var objimagen = mongoose.model('imagenes', imagenes);

module.exports = objimagen;
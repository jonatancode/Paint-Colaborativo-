var Pinceladas = require('../../model/pincelada');
var Imagenes = require('../../model/imagenes');
var fs = require("fs");
module.exports = function(app){

	var server = require('http').createServer(app);
	var io = require('socket.io').listen(server);
	var port = Number(process.env.PORT || 3000);
	server.listen(port);
	
	io.on('connection', function(socket){
		console.log("Hay alguien conectado")
		socket.emit("messages", { mensaje : "Hola soy el servidor"});

		/*	ENVIAR TRAZOS GUARDADOS EN MONG0DB*/
		socket.on("send trazos", function(){
			Pinceladas.find({}, function(err, data){
				socket.emit("server trazos", {data});
			});

		})

		/*	ENVIA IMAGENES DE LA BASE DE DATOS*/
		socket.on("getinfo image", function(){
			/* BUSCA EN LA BASE DE DATOS*/
			Imagenes.find({}, function(err, data){
				//console.log(data[0].imagen);
				//var imagen = new Buffer(data[0].imagen).toString("base64");
				//data[0].imagen = imagen;
				socket.emit("viewinfo imageDB", data)
			})
		})

		// recibe datos del cliente y los envia los compalñeros
		socket.on("dibujo_cliente", function(data){
			/* GUARDAR PINCELADAS EN MONGODB*/
			var trazos = new  Pinceladas({
					color : data.color,
					tamano : data.tamano,
					coordenadas : data.coordenadas
			})
			trazos.save( function(err){
				if (err) {
					console.log("Hay un error");
				}
				else{
					console.log("Guardado correctamente.");
				}

			})

			/* envia a todos los usuer menos al que activa el evento*/
			socket.broadcast.emit("linea_Companero", data);
		})
		/*
			 DISTRIBUIR IMAGEN SUBIDA OR EL USUARIO
		*/

		socket.on('imagen', function(data){
			//console.log(data);
			socket.broadcast.emit('imagen usuarios', data);

			/* GUARDA EN LA BASE DE DATOS*/
			var img = new Imagenes({
				//imagen : data.imagen,
				coordenadas : data.coordenadas,
				nombre : data.nombre+".png"
			})

			img.save( function(err){
				if (err) { console.log("Error")}
				else{ console.log("Guardado")}
			})

			// GUARDA IMAGEN EN CARPETA IMAGENES
			var base64Data = data.imagen.replace(/^data:image\/png;base64,/, "");

			fs.writeFile("./public/images/"+data.nombre+".png", base64Data, "base64", function(err){})

		})


	});
}


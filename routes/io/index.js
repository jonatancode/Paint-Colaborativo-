var Pinceladas = require('../../model/pincelada');
var Imagenes = require('../../model/imagenes');
var Detalle_lienzo = require('../../model/detalles_lienzo');
var Buscar_pinceladas = require('../buscar_pinceladas/');
var fs = require("fs");

module.exports = function(app){

	var server = require('http').createServer(app);
	var io = require('socket.io').listen(server);
	var port = Number(process.env.PORT || 3000);
	server.listen(port);
	
	io.on('connection', function(socket){
		console.log("Hay alguien conectado");
		/* RECIVE EL TAMAÑO DE LA PANTALLA*/
		socket.on("pantalla usuario", function(tamano){
			console.log("Tamaño alto del usuario: " + tamano.h);
			console.log("Tamaño ancho del usuario: " + tamano.w);
			/*Buscamos tamaño del lienzo*/
			var width_user = tamano.w;
			var heigth_user  = tamano.h;

			/* Realizar promsesa */
			var detalles = new Promise ( function(resolve, reject){
				/* OBTENEMOS EL ANCHO TOTAL DEL LIENZO*/
				Detalle_lienzo.find( function(err, data){
					if (err) {
						console.log(err);
					}
					//console.log(data);
					var respuesta = {
						width : data[0].width,
						heigth :data[0].heigth
					}
					resolve(respuesta);
				})
			})
			detalles.then( function(result){
				console.log(result);
				var width_total = result.width
				var heigth_total = result.heigth;
				/* restamos el tamaño del lienzo del cliente al total*/
				var width_relativo = width_total - width_user;
				var heigth_relativo = heigth_total - heigth_user;
				/* Buscamos el valor 0,0  para el cliente, será relativo al servidor*/
				/* obtenemos dos valores alaeatorio entre 0 y width; 0 y heigth */
				/* El cliente podra dicujar en las coorednadas ejex_0, ejey_0 y fin_ejex, fin_ejey */
				var ejex_0 = Math.floor(Math.random() * (width_relativo - 0) + 0);
				var ejey_0 = Math.floor(Math.random() * (heigth_relativo - 0) + 0);

				var fin_ejex = ejex_0 + width_user;
				var fin_ejey = ejey_0 + heigth_user;
				var objeto = {
					ejex_0 :ejex_0,
					ejey_0 :ejey_0,
					fin_ejex : fin_ejex,
					fin_ejey : fin_ejey,
					width_total : width_total,
					heigth_total: heigth_total
				}
				console.log("Fin detalles");
				return [ejex_0,ejey_0, fin_ejex, fin_ejey]
			}).then(function(result){
					/* DESCARGA los datos de la base de datos */
					var [ejex_0,ejey_0, fin_ejex, fin_ejey] = result
					var busca = new Promise ( function(resolve, reject){
						Pinceladas.find({ejex : {"$gte": ejex_0, "$lt": fin_ejex}, ejey: {"$gte": ejey_0, "$lt": fin_ejey} }, function(err, data){
							if (err) { 
								console.log(err);
							}
							else{
								//console.log("datos");
								var objeto  = []

								if (data.length > 0) {
									console.log(data[0]);
									for (var i = 0; i < data.length; i++) {
										var item = {}
										item.color= data[i].color;
										item.tamano= data[i].tamano;
										item.ejex= data[i].ejex - ejex_0 ;
										item.ejey= data[i].ejey - ejey_0;
										objeto.push(item);
										if (i == data.length-1) {
											resolve(objeto);
											
										}
									}
								}else{
									resolve("none");
								}

							}
						})
						
					})

					busca.then( function(result){
						console.log("Terminado")
						console.log("Tú estas x : "+ ejex_0 +"\n" + "TU estas en y : "+ ejey_0)
						if (result != "none") {
							console.log(result.length)
							var objeto = {
								resultado : result,
								ejes : [ejex_0, ejey_0]
							}
							
						}
						else{
							var objeto = { 
								vacio : true,	
								ejes : [ejex_0, ejey_0]
							}
						}

						socket.emit("datos lienzo", objeto);
					})
			})
		})

		socket.emit("messages", { mensaje : "Hola soy el servidor"});

		/*	ENVIAR TRAZOS GUARDADOS EN MONG0DB*/
		/*	socket.on("send trazos", function(){
			Pinceladas.find({}, function(err, data){
				socket.emit("server trazos", data);
			});

		})*/

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
			/* GUARDAR TRAZOS EN MONGODB*/
			// var trazos = new  Pinceladas({
			// 		color : data.color,
			// 		tamano : data.tamano,
			// 		coordenadas : data.coordenadas
			// })
			// trazos.save( function(err){
			// 	if (err) {
			// 		console.log("Hay un error");
			// 	}
			// 	else{
			// 		console.log("Guardado correctamente.");
			// 	}

			// })
			/*  Guarda pixeles*/
			var pixel = new Pinceladas({
					color : data.color,
					tamano : data.tamano,
					ejex : data.ejex,
					ejey : data.ejey
			})
			pixel.save( function(err){
				if (err) {
					console.log(err);
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

		/* 	USUARIOS ELIGE SU UBICACION */

		socket.on("eligo ubicacion", function(datos){
			console.log("cambiando ubicacion");
			console.log(datos);
			var ejex_inicio =  Number(datos.ejex);
			var ejex_fin =	Number(datos.ejex + datos.width);

			var ejey_inicio =  Number(datos.ejey);
			var ejey_fin = Number(datos.heigth + datos.ejey);

			var busca_datos_lienzo = new Promise( function( resolve, reject){
				Pinceladas.find({ejex : {"$gte": ejex_inicio, "$lt": ejex_fin}, ejey: {"$gte": ejey_inicio, "$lt": ejey_fin} }, function(err, data){
					if (err) { 
						console.log(err);
					}
					else{
						//console.log("datos");
						var objeto  = []

						if (data.length > 0) {
							console.log(data[0]);
							for (var i = 0; i < data.length; i++) {
								var item = {}
								item.color= data[i].color;
								item.tamano= data[i].tamano;
								item.ejex= data[i].ejex - ejex_inicio ;
								item.ejey= data[i].ejey - ejey_inicio;
								objeto.push(item);
								if (i == data.length-1) {
									resolve(objeto);
									
								}
							}
						}else{
							resolve("none");
						}

					}
				})
			
			})/* fin promsesa*/

			busca_datos_lienzo.then( function(result){

				socket.emit("recibe nuevaUbicacion", result)
			})
		})
	});
}


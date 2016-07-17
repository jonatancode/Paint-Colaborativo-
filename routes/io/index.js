module.exports = function(app){

	var server = require('http').createServer(app);
	var io = require('socket.io').listen(server);
	var port = Number(process.env.PORT || 3000);
	server.listen(port);
	
	io.on('connection', function(socket){
		console.log("Hay alguien conectado")
		socket.emit("messages", { mensaje : "Hola soy el servidor"});
		// recibe datos del cliente y los envia los compalñeros
		socket.on("dibujo_cliente", function(data){
			io.emit("linea_Companero", data);
		})
	});
}


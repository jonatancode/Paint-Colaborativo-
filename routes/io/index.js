module.exports = function(app){

	var server = require('http').createServer(app);
	var io = require('socket.io').listen(server);
	server.listen(3000);
	
	io.on('connection', function(socket){
		console.log("Hay alguien conectado")
		socket.emit("messages", { mensaje : "Hola soy el servidor"});
		// recibe datos del cliente y los envia los compalñeros
		socket.on("dibujo_cliente", function(data){
			io.emit("linea_Companero", data);
		})
	});
}


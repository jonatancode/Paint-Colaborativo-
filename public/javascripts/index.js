window.addEventListener('load', function(){
	var canvas = document.getElementById("canvas");
	ctx = canvas.getContext("2d");

	canvas.addEventListener('click', function(e){
		canvas.addEventListener('mousemove', dibuja, false);
		canvas.addEventListener('click', comprueba, false);
	}, false);
	 // descarga
	var button = document.getElementById('btn-download');
	button.addEventListener('click', descarga, false);

	// Color
	var color = document.getElementById("color");
	color.addEventListener("change", cambia_propiedades, false);
	// Tamaño
	var tamano = document.getElementById("tamano");
	tamano.addEventListener("change", cambia_propiedades, false);


}, false)
var canvasX = false;
var canvasY = false;
var mousemove = false;
// objeto pincel
function Pincel(tamano, color){
	this.tamano = tamano;
	this.color = color;

	this.setColor = function(newColor){
		this.color = newColor;
	}	
	this.setTamano = function(newTamano){
		this.tamano = newTamano;
	}	

	this.getColor = function(newColor){
		return this.color;
	}	
	this.getTamano = function(newTamano){
		return this.tamano;
	}
}

pincel = new Pincel(10, "#000000");

function dibuja(e){
	mousemove = true;
	
	if (!canvasX & !canvasY) {
		canvasY = canvas.offsetTop;
		canvasX = canvas.offsetLeft;
	}
	var x = e.clientX - canvasX;
	var y = e.clientY - canvasY;
	var h = pincel.tamano;
	var w = pincel.tamano;
	//console.log(e);
	//console.log(e.clientX);
	//console.log(e.clientY);
	ctx.beginPath();
	ctx.lineCap="round";
	ctx.lineWidth=pincel.tamano;
	ctx.moveTo(x,y);
	ctx.lineTo(x+1,y+1);
	ctx.strokeStyle = pincel.color;
	ctx.stroke();
	var datos = {
		x : x,
		y : y,
		tamano : pincel.tamano,
		color : pincel.color
	}
	/* pinceladas del cliente */
	socket.emit("dibujo_cliente", datos);
	//ctx.fillStyle = "red";
	//ctx.fillRect(x, y, w, h);
}

function comprueba(){
	console.log("hola");
	if (mousemove) {
		canvas.removeEventListener('mousemove', dibuja, false);
		mousemove = false;
		// Dejamos escuchando canvas el click
		canvas.addEventListener('click', function(){
		},false)
		
	}

}

/*
	OPCIONES
*/
function cambia_propiedades(e){
	var event = e;
	var type = e.target.id;
	if (type) {
		if (type == "color") {
			var color = event.target.value;
			pincel.setColor(color);
		}

		if(type == "tamano"){
			var tamano = Number(event.target.value);
			pincel.setTamano(tamano);
		}
	}
}

function descarga(){
	var dataUrl = canvas.toDataURL();
	dataUrl=dataUrl.replace("image/jpg",'image/octet-stream'); // sustituimos el tipo por octet
	document.location.href = dataUrl; 
}



var socket = io('http://localhost:3000');



socket.on('messages', function (data) {
	console.log(data);
})

socket.on("linea_Companero", function(data){
	dibujaCompanero(data);
});

function dibujaCompanero(objeto){
	var x = objeto.x;
	var y = objeto.y;
	var h = objeto.tamano;
	var w = objeto.tamano;
	//console.log(e);
	//console.log(e.clientX);
	//console.log(e.clientY);
	ctx.beginPath();
	ctx.lineCap="round";
	ctx.lineWidth=objeto.tamano;
	ctx.moveTo(x,y);
	ctx.lineTo(x+1,y+1);
	ctx.strokeStyle = objeto.color;
	ctx.stroke();
}
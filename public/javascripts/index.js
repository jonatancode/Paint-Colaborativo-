window.addEventListener('load', function(){
	var canvas = document.getElementById("canvas");
	canvas.setAttribute('width', pantalla.getwidth() );
	canvas.setAttribute('height', pantalla.getheight() );
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

function calcula_tamano_pantalla(){
	this.width = null;
	this.height = null;
	this.getwidth = function getwidth(){
		this.width = document.body.clientWidth;
		return document.body.clientWidth;
	}
	this.getheight = function (){
		this.height = document.body.clientHeight;
		return document.body.clientHeight;
	}
}
var pantalla = new calcula_tamano_pantalla();

var canvasX = false;
var canvasY = false;
var mousemove = false;
var controles_ocultos = false;
var panel = null;

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
	if (!controles_ocultos) {
		panel = document.getElementById('controles');
		panel.classList.add("inactive");
	}
	var x = e.clientX;
	var y = e.clientY;
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
	socket.emit("dibujo_cliente", datos);
}

function comprueba(){
	console.log("hola");
	if (mousemove) {
		canvas.removeEventListener('mousemove', dibuja, false);
		mousemove = false;
		// Dejamos escuchando canvas el click
		canvas.addEventListener('click', function(){
		},false)
		panel.classList.remove("inactive");
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
	dataUrl=dataUrl.replace("image/png",'image/octet-stream'); // sustituimos el tipo por octet
	document.location.href = dataUrl; 
}



var socket = io();

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
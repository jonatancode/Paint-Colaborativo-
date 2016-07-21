var canvas = null;
window.addEventListener('load', function(){
	canvas = document.getElementById("canvas");
	canvas.setAttribute('width', pantalla.getwidth() );
	canvas.setAttribute('height', pantalla.getheight() );
	ctx = canvas.getContext("2d");

	canvas.addEventListener('click', eventcanvas, false);

	 // descarga
	var button = document.getElementById('btn-download');
	button.addEventListener('click', descarga, false);

	// Color
	var color = document.getElementById("color");
	color.addEventListener("change", cambia_propiedades, false);
	// Tamaño
	var tamano = document.getElementById("tamano");
	tamano.addEventListener("change", cambia_propiedades, false);

	//exit panel
	var exit = document.getElementById("exit");
	exit.addEventListener('click', exitpanel, false)

	// añadir imagen 
	var addimagen = document.getElementById("addimage");
	addimagen.addEventListener("change", addimageprev, false)
	addimagen.addEventListener("click", captura_raton, false)
	// apagar canvas
	var apagar = document.getElementById("apagar");
	apagar.addEventListener("click", quitarcanvas, false);
}, false)

/*eventode canvas*/
function eventcanvas(e){
	document.getElementById("canvas").addEventListener('mousemove', dibuja, false);
	document.getElementById("canvas").addEventListener('click', comprueba, false);
}
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
		canvas.addEventListener('click', false)
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
	//var dataUrl = canvas.toDataURL();
	//dataUrl=dataUrl.replace("image/png",'image/octet-stream'); // sustituimos el tipo por octet
	//document.location.href = dataUrl; 
	// PASAMOs LOS DATOS A BLOB
	canvas.toBlob(function (blob) {
		var reader = new FileReader(); // instanciamos FILEREADER

	  	reader.onload = function(e){
	  		document.getElementById("imagen").innerHTML = "";
	  		var img = new Image(); // creamos imagen
	  		img.src = reader.result; // el resultado del binario en src  
	  		document.getElementById("dowload").href = reader.result; //DESCARGA
	  		document.getElementById("dowload").target = "_blank";  //DESCARGA NUEVA PESATAÑA
	  		document.getElementById("dowload").download = "archivodescarga.png";  //DESCARGA NOMBRE
	  		document.getElementById("imagen").appendChild(img); // pintamos en pantalla
	  	}
	  	reader.readAsDataURL(blob);// lee el binario 
	});

	// mostrar panel de descarga
	document.getElementById("descarga").classList.remove("oculto");
}
function exitpanel(){
	document.getElementById("descarga").classList.add("oculto")
}
pos_raton_y = 0 
pos_raton_x = 0
function captura_raton(e){
	document.body.addEventListener("mousemove", ver, false);
}
function ver(e) {
	pos_raton_y = e.clientY;
	pos_raton_x = e.clientX;
}
/* añadir imagen ver previa*/
function addimageprev(e){
	var imagencruda = e.target.files[0]
	var reader = new FileReader();
	var previa = new Image();


	reader.onload = function(){
		previa.src = reader.result;
		document.getElementById("virtual-image").appendChild(previa);
		document.getElementById("virtual-image").classList.add("mostrar");
		altoimg = document.getElementById("virtual-image").childNodes[0].height;
		anchoimg = document.getElementById("virtual-image").childNodes[0].width;
		document.getElementById("virtual-image").style.top = pos_raton_y +"px";
		document.getElementById("virtual-image").style.left = pos_raton_x+"px";
		console.log(e);
		console.log(e.clientX);
		quitarcanvas();
	}
	if (imagencruda){
		reader.readAsDataURL(imagencruda);
	}else{
		previa.src = "";
		alert("Eror de imagen");
	}
}
var mostrar = document.getElementsByClassName("mostrar")[0];
function colocarimagen(e){
	console.log(e.clientX);
	console.log(e.clientY);
	if (mostrar) {
		
	}else{
		mostrar =  document.getElementsByClassName("mostrar")[0];
		altoimg = mostrar.childNodes[0].height;
		anchoimg = mostrar.childNodes[0].width;
	}
	mostrar.style.top = e.clientY - altoimg/2 +"px";
	mostrar.style.left = e.clientX - anchoimg /2  +"px";
}

/*PRUEBA*/
function quitarcanvas(){
	/*quitar evento de canvas*/
	document.getElementById("canvas").removeEventListener('click', eventcanvas, false);
	document.getElementById("canvas").removeEventListener('mousemove', dibuja, false);
	document.getElementById("canvas").removeEventListener('click', comprueba, false);

	document.getElementsByClassName("mostrar")[0].addEventListener("mousemove", colocarimagen, false);
	document.getElementsByClassName("mostrar")[0].addEventListener('click', activar_canvas, false);
	console.log("eliminado");
}

function activar_canvas(e){
	console.log("Anclar imangen");
	//console.log(e.clientX)
	//console.log(e.clientY)
	// dibujar imagen
	// img, ejeX, ejexY, ancho, alto
	ctx.drawImage( mostrar.childNodes[0], e.clientX , e.clientY, anchoimg, altoimg);
	// borrar div mostrar
	document.getElementById("virtual-image").innerHTML= "";
	document.getElementById("virtual-image").classList.remove("mostrar");
	
	document.getElementById("canvas").removeEventListener("mousemove", colocarimagen, false);
	document.getElementById("canvas").addEventListener('click', eventcanvas, false);
	document.getElementById("canvas").removeEventListener('click', activar_canvas, false);
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
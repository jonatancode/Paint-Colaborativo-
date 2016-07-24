
var canvas = null;
var panel = null;
var mousemove = false;
var controles_ocultos = false;

var container_image_prev = null;

var pantalla = new calcula_tamano_pantalla();

var btn_dowload = null;
var container_dowload = null;

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


	// añadir imagen 
	var addimagen = document.getElementById("addimage");
	addimagen.addEventListener("change", addimageprev, false)

	//exit panel
	var exit = document.getElementById("exit");
	exit.addEventListener('click', exitpanel, false)
	
	btn_dowload = document.getElementById("dowload");
	container_dowload=  document.getElementById("descarga");

	/* PIDE IMAGENES DE LA BASE DE DATOS*/
	socket.emit("getinfo image", {})

}, false)

/*evento de canvas*/
function eventcanvas(e){
	canvas.addEventListener('mousemove', dibuja, false);

	/* 3s*/
	enviar_buffer = setInterval( function(){ reloj() }, 3000);
	
}

function reloj(){
	if (buffer.coordenadas.length != 0) {
		buffer.tamano = pincel.tamano;
		buffer.color = pincel.color;
		socket.emit("dibujo_cliente", buffer);
		buffer.coordenadas = [];
	}

}

/*
	Ocultar Panel
*/

function ocultaPanel(opcion){
	if (!panel){
		panel = document.getElementById('controles');
	}

	if (opcion) {
		panel.classList.add("inactive");
	}
	else{
		panel.classList.remove("inactive");
	}
}
/*

 	BUFFER cada 5s se enviará
*/
buffer = {
	tamano : "",
	color : "",
	coordenadas : []
}


function dibuja(e){
	if (!mousemove) {
		mousemove = true;
	}
	
	if (!controles_ocultos) {
		ocultaPanel(true);
	}
	var x = e.clientX;
	var y = e.clientY;
	ctx.beginPath();
	ctx.lineCap="round";
	ctx.lineWidth = pincel.tamano;
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
	var ejes = [x, y]
	buffer.coordenadas.push(ejes);
	canvas.addEventListener('click', comprueba, false);
}

function comprueba(){
	console.log("Comprobando");
	if (mousemove) {
		mousemove = false;
		ocultaPanel(false);
		canvas.removeEventListener('mousemove', dibuja);
		canvas.removeEventListener('click', comprueba)

		console.log(buffer);
		if (buffer.coordenadas.length != 0) {
			buffer.tamano = pincel.tamano;
			buffer.color = pincel.color;
			clearInterval(enviar_buffer);
			socket.emit("dibujo_cliente", buffer);
			buffer.coordenadas = [];
		}
	}
}

/*
	OPCIONES DEL PINCEL
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

	// PASAMOs LOS DATOS A crudo
	canvas.toBlob(function (blob) {
		var reader = new FileReader(); // instanciamos FILEREADER

	  	reader.onload = function(e){
	  		document.getElementById("imagen").innerHTML = "";
	  		var img = new Image(); // creamos imagen
	  		img.src = reader.result; // el resultado del binario en src  
	  		btn_dowload.href = reader.result; //DESCARGA
	  		btn_dowload.target = "_blank";  //DESCARGA NUEVA PESATAÑA
	  		btn_dowload.download = "archivodescarga.png";  //DESCARGA NOMBRE
	  		document.getElementById("imagen").appendChild(img); // pintamos en pantalla
	  	}
	  	reader.readAsDataURL(blob);// lee el binario 
	});

	// container_image_prev panel de descarga
	container_dowload.classList.remove("oculto");
}

function exitpanel(){
	container_dowload.classList.add("oculto");
}


/*
	ImagenPropiedades (imagen, height, width, src, name)
*/
var imagenprueba = new ImagenPropiedades();

/* añadir imagen ver previa*/
function addimageprev(e){
	// controlo el raton
	imagenprueba.imagen =  e.target.files[0];
	var reader = new FileReader();
	var previa = new Image();

	reader.onload = function(){
		previa.src = reader.result;
		imagenprueba.imagen = previa;

		document.getElementById("virtual-image").appendChild(previa);
		document.getElementById("virtual-image").classList.add("mostrar");

		container_image_prev = document.getElementById("virtual-image");
		ocultaPanel(true);
		imagenprueba.height = container_image_prev.childNodes[0].height;
		imagenprueba.width = container_image_prev.childNodes[0].width;

		canvas.removeEventListener('click', eventcanvas, false);
		canvas.removeEventListener('mousemove', dibuja, false);
		//canvas.removeEventListener('click', comprueba, false);

		container_image_prev.addEventListener("mousemove", moverImagen, false);
		/* Al reazalizar click añade imagen y.. elimina eventos de otros elementos*/
		container_image_prev.addEventListener('click', insertarImagen, false);
	}
	if (imagenprueba.imagen){
		reader.readAsDataURL(imagenprueba.imagen);
		document.body.addEventListener("mousemove", controlarmouse, false);
	}else{
		previa.src = "";
		imagenprueba =null;
		alert("Eror de imagen");
	}
}

function moverImagen(e){
	//console.log(e.clientX);
	//console.log(e.clientY);
	container_image_prev.style.top = e.clientY - imagenprueba.height/2 +"px";
	container_image_prev.style.left = e.clientX - imagenprueba.width /2  +"px";
}
/*
	ISERTA IMAGEN Y ENVIA IMAGEN AL SERVIDOR
*/
function insertarImagen(e){

	/* DIBUJA IMAGEN EN CANVAS */
	// img, ejeX, ejexY, ancho, alto
	//console.log(imagenprueba.imagen);
	ctx.drawImage( imagenprueba.imagen, e.clientX - imagenprueba.width /2 , e.clientY - imagenprueba.height/2, imagenprueba.width, imagenprueba.height);
	/*
		Enviar imagen al servidor
	*/
	imagenprueba.coordenadoas = [e.clientX - imagenprueba.width /2 , e.clientY - imagenprueba.height/2];

	enviarImagen(imagenprueba);

	
	canvas.removeEventListener("mousemove", moverImagen, false);
	canvas.addEventListener('click', eventcanvas, false);
	canvas.removeEventListener('click', insertarImagen, false);
	/*ELimina evento del body*/
	document.body.removeEventListener('mousemove', controlarmouse, false);

	// Elimnar eventos del elemento container_image_prev
	container_image_prev.addEventListener('mousemove', moverImagen);
	container_image_prev.addEventListener('click', insertarImagen);
	container_image_prev.innerHTML= "";
	container_image_prev.classList.remove("mostrar");

	ocultaPanel(false);
}

/* AÑADE LA IMAGEN AL RATON*/
function controlarmouse(e){
	container_image_prev.style.top = e.clientY- imagenprueba.width/2 +"px";
	container_image_prev.style.left = e.clientX  - imagenprueba.height/2 +"px";
}


var socket = io();
/* Pide trazos guradaos*/
socket.emit("send trazos", {});



/* PINTA TRAZXOS DE la base da datos*/
socket.on("server trazos", function(data){
	console.log(data);
	data.data.forEach( function(element, index){
		dibujaCompanero(element);
	})
})

socket.on('messages', function (data) {
	console.log(data);
})

socket.on("linea_Companero", function(data){
	dibujaCompanero(data);
});

function dibujaCompanero(objeto){
	//console.log(objeto);

	objeto.coordenadas.forEach(function(elemt, index){
		//console.log(i);
		var x = elemt[0];
		var y = elemt[1];

		ctx.beginPath();
		ctx.lineCap="round";
		ctx.lineWidth=objeto.tamano;
		ctx.moveTo(x,y);
		ctx.lineTo(x+1,y+1);
		ctx.strokeStyle = objeto.color;
		ctx.stroke();

	});
}

/* VIEW INFO IMAGE FOR DATABASE*/
socket.on("viewinfo imageDB", function(objIMG){
	console.log(objIMG);
	
	objIMG.forEach( function(image, index){
		var img = new Image();
		img.src = "/images/"+ image.nombre
		img.onload = function(){
			ctx.drawImage( img, image.coordenadas[0], image.coordenadas[1]);
		}
	})
})

/*
	MUESTRA IMAGEN ENVIADA POR LOS USARIOS
*/

var imagenEscribir = null;

function enviarImagen(imagen){
	//console.log(imagen.imagen);
	var nombre = Math.floor(Math.random() * (99999 - 0) +0).toString();
	var objeto = {
		imagen : imagen.imagen.src,
		nombre : nombre,
		coordenadas : imagen.coordenadoas
	}
	socket.emit('imagen', objeto );
}

/* RECIBE IMAGENES DE LOS USUARIOS*/
socket.on("imagen usuarios", function(imagen){

	console.log("IMagen recibida");
	console.log(imagen);
	var img = new Image();
	//var imgCrudo = window.atob(imagen.imagen);
	img.src = imagen.imagen;

	ctx.drawImage( img, imagen.coordenadas[0], imagen.coordenadas[1]);
	
})



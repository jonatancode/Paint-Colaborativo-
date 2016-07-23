
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
}, false)

/*evento de canvas*/
function eventcanvas(e){
	canvas.addEventListener('mousemove', dibuja, false);
	canvas.addEventListener('click', comprueba, false);
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

 	BUFFER cada 20s se enviará
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
	//console.log(e);
	//console.log(e.clientX);
	//console.log(e.clientY);
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

}

function comprueba(){
	if (mousemove) {
		canvas.removeEventListener('mousemove', dibuja, false);
		mousemove = false;
		// Dejamos escuchando canvas el click
		canvas.addEventListener('click', false)

		ocultaPanel(false);
		buffer.tamano = pincel.tamano;
		buffer.color = pincel.color;
		console.log(buffer);
		socket.emit("dibujo_cliente", buffer);
		
		buffer.coordenadas = [];
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
		canvas.removeEventListener('click', comprueba, false);

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
	enviarImagen(imagenprueba.imagen.src);
	datosImagen(e.clientX - imagenprueba.width /2 , e.clientY - imagenprueba.height/2);

	
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

socket.on('messages', function (data) {
	console.log(data);
})

socket.on("linea_Companero", function(data){
	dibujaCompanero(data);
});

function dibujaCompanero(objeto){
	console.log(objeto);

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


/*
	MUESTRA IMAGEN ENVIADA POR LOS USARIOS
*/
var imagenEscribir = null;
socket.on("imagen usuarios", function(imagen){
	//console.log(imagen)
	image = new Image();
	image.src = imagen;
	imagenEscribir = image; 
	console.log("IMagen recibida")
})

socket.on("serverDatosImagen", function(objeto){
	ctx.drawImage( imagenEscribir, objeto.ejex, objeto.ejey);

})

function enviarImagen(imagen){
	socket.emit('imagen', imagen);
}
function datosImagen(ejex, ejey){
	var objeto= {
		ejex : ejex,
		ejey : ejey
	}
	socket.emit('sendDatosImagen', objeto);
	imagenprueba.clean();
}

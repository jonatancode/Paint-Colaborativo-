
var canvas = null;
var panel = null;
var mousemove = false;
var controles_ocultos = false;

var container_image_prev = null;

var pantalla = new calcula_tamano_pantalla();

var btn_dowload = null;
var container_dowload = null;
var lienzo_real = {
	//ejex
	//ejey
}
var mando_lienzo = null;
var up = null;
var rigth = null;
var down = null;
var left = null;
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

	/*ENvia tamaño pantalla */
	socket.emit("pantalla usuario", { w: pantalla.getwidth(), h: pantalla.getheight() })
	socket.on("datos lienzo", function(dato){
		console.log(dato.ejes);
		if (!dato.vacio ) {
			dibujaCompanero(dato.resultado, "nuevo")
		}
		lienzo_real.ejex = dato.ejes[0]
		lienzo_real.ejey = dato.ejes[1]
	});
	/* MANDO LIENZO */
	mando_lienzo = document.getElementById("mando");
	mando_lienzo.addEventListener('click', cambia_direccion, false);

}, false)

/*evento de canvas*/
function eventcanvas(e){
	canvas.addEventListener('mousemove', dibuja, false);

	/* 3s*/
	//enviar_buffer = setInterval( function(){ reloj() }, 3000);
	
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
	//buffer.coordenadas.push(ejes);
	socket.emit("dibujo_cliente", {
		color : pincel.color,
		tamano : pincel.tamano,
		ejex : x + lienzo_real.ejex,
		ejey : y + lienzo_real.ejey
	});
	canvas.addEventListener('click', comprueba, false);
}

function comprueba(){
	console.log("Comprobando");
	if (mousemove) {
		mousemove = false;
		ocultaPanel(false);
		canvas.removeEventListener('mousemove', dibuja);
		canvas.removeEventListener('click', comprueba)

		//console.log(buffer);
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
/*socket.on("server trazos", function(data){
	//console.log(data);
	if (data[0]) {
		dibujaCompanero(data);
	}
	data.data.forEach( function(element, index){
		dibujaCompanero(element);
	})
})*/

socket.on('messages', function (data) {
	console.log(data);
})

socket.on("linea_Companero", function(data){
	 var width = pantalla.getwidth();
	 var heigh = pantalla.getheight();
	if ( (data.ejex > lienzo_real.ejex && data.ejex < lienzo_real.ejex +  width) && ( data.ejey > lienzo_real.ejey && data.ejey < lienzo_real.ejey +  heigh)) {
		//console.log(lienzo_real);
		console.log(data);
		dibujaCompanero(data, "anadir");
	}
});

function dibujaCompanero(objeto, nuevo){
	//console.log(objeto.length)
	if (nuevo == "anadir") {
		console.log("Esot anadiento");
		console.log("ancho: " + pantalla.getwidth());
		var x =  objeto.ejex - lienzo_real.ejex;
		var y =  objeto.ejey- lienzo_real.ejey ;
		console.log(x +"\n"+y);
		ctx.beginPath();
		ctx.lineCap="round";
		ctx.lineWidth=objeto.tamano;
		ctx.moveTo(x,y);
		ctx.lineTo(x+1,y+1);
		ctx.strokeStyle = objeto.color;
		ctx.stroke();

	}
	if (nuevo == "nuevo") {
		ctx.clearRect(0, 0, pantalla.getwidth(), pantalla.getheight());
	}

	if (objeto.length > 0) {
		//console.log(objeto);
		objeto.forEach(function(elemt, index){
			var x = elemt.ejex;
			var y = elemt.ejey;
			ctx.beginPath();
			ctx.lineCap="round";
			ctx.lineWidth=elemt.tamano;
			ctx.moveTo(x,y);
			ctx.lineTo(x+1,y+1);
			ctx.strokeStyle = elemt.color;
			ctx.stroke();

		});
		
	}
	else {

	}

}

/* VIEW INFO IMAGE FOR DATABASE*/
socket.on("viewinfo imageDB", function(objIMG){
	if (objIMG[0]) {
		console.log(objIMG);
		objIMG.forEach( function(image, index){
			var img = new Image();
			img.src = "/images/"+ image.nombre
			img.onload = function(){
				ctx.drawImage( img, image.coordenadas[0], image.coordenadas[1]);
			}
		})
		
	}
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

function cambia_direccion(e){
	//console.log(e.target.getAttribute("value"));
	var value = e.target.getAttribute("value"); 
	if (value != "") {
		if (value == "up") {
			lienzo_real.ejey--;
			//console.log(lienzo_real.ejey)
			console.log(lienzo_real.ejey)
		}
		else if (value == "rigth") {
			lienzo_real.ejex++;
		}
		else if ( value == "down"){
			lienzo_real.ejey++;
		}
		else if ( value ==  "left"){
			lienzo_real.ejex--;
		}
		elige_ubicacion(lienzo_real.ejex, lienzo_real.ejey)
	}

}


function elige_ubicacion(x, y){
	lienzo_real.ejex = x;
	lienzo_real.ejey = y;
	socket.emit("eligo ubicacion", {
		ejex : x,
		ejey : y,
		width : pantalla.getwidth(),
		heigth : pantalla.getheight()
	})
}

socket.on("recibe nuevaUbicacion", function(datos){
	console.log(datos);
	var nuevo = "nuevo";
	dibujaCompanero(datos, nuevo);
})


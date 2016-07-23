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

/*
	PROPIEDAD DE LA PANTALLA
*/
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


function ImagenPropiedades (imagen, height, width, src, name, imagencrudo){
	this.imagen = imagen;
	this.height = height;
	this.width = width;
	this.src = src;
	this.name = name;
	this.imagencruda = imagencrudo;

	this.setHeight = function(height){
		this.height;
	}	

	this.setWidth = function(width){
		this.height;
	}
	this.clean = function () {
		this.imagen = "undefined";
		this.height = "undefined";
		this.width = "undefined";
		this.src = "undefined";
		this.name = "undefined";
		this.imagencruda = "undefined";
	}
}



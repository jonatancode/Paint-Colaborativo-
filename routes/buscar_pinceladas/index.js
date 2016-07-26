var Pinceladas = require('../../model/pincelada');
exports.busca = function  (ejex_0, ejey0, fin_ejex, fin_ejey){
	console.log("Buscando..")
	var busca = new Promise ( function(resolve, reject){
		Pinceladas.find({ejex : {"$gte": 0, "$lt": 450}}, function(err, data){
			if (err) { 
				console.log(err);
			}
			else{
				//console.log("datos");
				//console.log(data.length);
				resolve(data);
			}
		})
		
	})

	busca.then( function(result){
		console.log("Terminado")
		console.log(result.length)
		return result;
	})

}
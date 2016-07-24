var express = require('express');
var router = express.Router();
var fs = require("fs");

/* GET home page. */
router.get('/', function(req, res, next) {
	console.log("router")
  	res.render('index');
});
/*router.get("/images/:nombre", function(req, res, next){
	console.log(req.params);
	res.sendFile("../images/"+req.nombre)
})*/
module.exports = router;

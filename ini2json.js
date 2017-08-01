module.exports = function parseIni(stream) {
	return new Promise((resolve, reject) => {
		stream = stream || process.stdin;
		var iniString = "" 
		var rn = "\r\n";
		var hr = "-".repeat(79);
		stream.setEncoding("utf8"); 
		stream.on("readable", function(){
			var next = stream.read();
			if(next && next != "null")
				iniString += next;
		}); 
		stream.on("end", function(data) {
			//console.log(data,rn,hr,rn);
			//iniString += data;
			//console.log(iniString);
			var obj = require("ini").parse(iniString);
			resolve(obj);
		});	
	});
}
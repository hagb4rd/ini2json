#!/usr/bin/env node

var args = require("minimist")(process.argv);
var fs = require("fs");
var path = require("path");




var cx = {
	mapSet(){
		return (k,i)=>`SET "${k[0]}=${k[1]}"`;
	},
	mapSetX(){
		return (k,i)=>`SETX ${k[0]} "${k[1]}"`;
	},
	mapVar() {
		return (k,i)=>`%${k}%`;
	},
	mapPath() {
			return (path)=>`SET "path_ext=${path}"`
	},
	pathSeparator: ";"
}

var posix = {
	mapSet(){
		return (k,i)=>`SET "${k[0]}=${k[1]}"`;
	},
	mapVar() {
		return (k,i)=>`%${k}%`;
	},
	mapPath() {
			return (path)=>`SET "path_ext=${path}"`
	},
	pathSeparator: ";"
}

var f = [

async function cmdSet () {

	var ini = await parseIni();
	var arr = Object.entries(ini).map(cx.mapSet());
	var out = arr.join("\r\n")+"\r\n";
	return out; 
},
async function cmdSetX () {

	var ini = await parseIni();
	var arr = Object.entries(ini).map(cx.mapSetX());
	var out = arr.join("\r\n")+"\r\n";
	return out; 
},
async function cmdPath () {

	var ini = await parseIni();
	var pathArr = Object.keys(ini).map(cx.mapVar());
	var path = pathArr.join(cx.pathSeparator)
	out += cx.mapPath()(path);
	return out; 
},

async function bashSet () {

	var ini = await parseIni();
	var arr = Object.entries(ini).map(posix.mapSet());
	var out = arr.join("\r\n")+"\r\n";
	return out; 
},
async function bashPath () {

	var ini = await parseIni();
	var pathArr = Object.keys(ini).map(posix.mapVar());
	var path = pathArr.join(posix.pathSeparator)
	out += cx.mapPath()(path);
	return out; 
}];


async function pipe() {
	var ini = await parseIni();
	console.log(JSON.stringify(ini));
}



async function cli(args) {
	var file = args.line || args.ini;
	var output = args.o;
	
	if(file && typeof(file == "string")) {
		var buffer = fs.readFileSync(file, {encoding: "utf8"}); 
	} else {
		var pipeBuffer = await pipeIn();
	}
	
	var s = buffer || pipeBuffer;
	
	if(args.line) {
		var arr = s.replace(/\r\n/g,"\n").split("\n");
		var json = JSON.stringify(arr.filter(entry=>!!entry.length));
	} else {
		var json = require("ini").parse(s);
	}
	
	
	
	if(output && typeof(output == "string")) {
		fs.writeFileSync(output, json, {encoding: "utf8"});
	}
	/*	
	if(output && typeof(output == "string")) {
		var out = fs.createWriteStream(path.resolve(output),{encoding:"utf8"});
		out.on("writeable", ()=>{
			out.write(json);
		})
	}
	*/
	console.log(json);
	
}


if(args.line) {
	cli(args);
} else {
	throw Error("USAGE:\ini2json --line [file] OR --ini [file] --o [file]");
}


async function parseIni(stream) {
	return require("ini").parse(await pipeIn());
}

async function pipeIn(stream) {
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
			//var obj = require("ini").parse(iniString);
			resolve(iniString);
		});	
	});
}



async function run(){
	var s;
	if(args._.length < 3) {
		s = await f.map((F,i)=>`${i}) ${F.name}`).join("\r\n")
	} else {
		var i = args._[2];
		console.log(require('util').inspect(args,{depth:null}));
		//console.log("i:",i);
		s = await f[i]();
	}
	console.log(s);
};


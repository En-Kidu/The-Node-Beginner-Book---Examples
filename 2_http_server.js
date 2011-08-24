// # 2. HTTP Server

// ## Basic

// You can seperate your code to keep it clean using modules.
// This allows you to have a clean main file, which you execute with Node.js, and clean
// modules that can be used by the main file and among each other.

// Let's create a main file which we use to start our application and
// a module file where our HTTP server code lives.

// It is common practice to name your main module file 'index.js'

// lib/1/server.js

var http = require('http');

http.createServer(function(request,response) {
  response.writeHead(200, {"Content-Type": "text/plain"});
  response.write("Hello World");
  response.end();
}).listen(8888);

// Run using 'node lib/1/server.js' and open up your browser to http://localhost:8888
// This should display a web page that says "Hello World"


// ## Analyzing our HTTP server

// Requires the http module that ships with node.js and makes it
// accessible through the variable http.
var http = require('http');

// Call one of the functions the http module offers: createServer.
// This function returns an object, and this object has a method named listen,
// and takes a numeric value which indicates the port number our HTTP server
// is going to listen on.
var server = http.createServer();
server.listen(8889);

// This server would not respond to any requests made to it.

// We pass the createServer method a function as its first and only parameter, which is
// called on each request to the server.
function onRequest(request,response) {
  response.writeHead(200, {'Content-Type': 'text/plain'});
  response.write('Hello World');
  response.end();
}
http.createServer(onRequest).listen(8890);


// ## Event-driven callbacks

// Node.js is event driven, hence why we write our HTTP server this way.
// Understanding node.js(http://debuggable.com/posts/understanding-node-js:4bd98440-45e4-4a9a-8ef7-0f7ecbdd56cb) provides a good read on
// how node.js works in the background.

// Requests to our HTTP server are asynchronous meaning it can happen at any give time.
// The program is not halted once the listen method is called. We can prove this by printing
// to STDOUT once our HTTP server starts listening to requests

http.createServer(onRequest).listen(8891);
console.log("Server has started");

// Event-driven asynchronous server-side JavaScript with callbacks


// ## How our server handles requests

// When the callback fires and our onRequest function gets called, two parameters are passed
// into it - request and response.

// We use and modify these objects before the response is returned.

function onRequest(request,response) {
  // We send a HTTP status of 200 and content-type in the response header
  response.writeHead(200, {'Content-Type': 'text/plain'});
  // Set the HTTP resonse body to 'Hello World'
  response.write('Hello World');
  // We finish the response
  response.end();
}

// ## Finding a place for our server module

// We have already used modules in our code, like this:

var http = require('http');
http.createServer();

// The module called 'http' comes bundled with Node.js. We make use of it
// by requiring it and assigning it to a local variable.

// You are not limited to using the same name as the module for your local variable, obviously.
var i_am_listening_to_giantbomb = require('http');
i_am_listening_to_giantbomb.createServer();

// Let's turn server-1.js into a real module.

// Making some code a module means we need to 'export' these parts of its functionality for use.

var http = require('http');

function start() {
  function onRequest(request,response) {
    console.log("Request received.");
    response.writeHead(200, {"Content-Type": "text/plain"});
    response.write("Hello World");
    response.end();
  }
  
  http.createServer(onRequest).listen(9001);
  console.log("Server has started.");
}

exports.start = start;

// This way we can now create our main file index.js and start our HTTP there,
// even though the code for the serer is in our server.js file.

var server = require('./lib/2/server');
server.start();

// or run 'node lib/2/index.js'

// We now have a very basic HTTP server that can receive HTTP requests.
// But we are unable to do anything with them. We need to point different requests
// to different parts of our code with 'routing'...
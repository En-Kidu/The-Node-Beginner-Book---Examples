// # 3. Routing Requests

// We need to be able to feed the requested URL and possible additional GET and POST
// parameters into our router. Based on these, the router then needs to
// be able to decide which code to execute.

// All this information is available to us within our onRequest method within the request object.

// We can use some additional node.js modules(namely url and querystring) to interpret this information.

// The url module allows us to extract different parts of a URL.
// The querystring module can in turn be used to parse the query string for request parameters

//                                url.parse(string).query
//                                            |
//            url.parse(string).pathname      |
//                        |                   |
//                        |                   |
//                      ------ -------------------
// http://localhost:8888/start?foo=bar&hello=world
//                                 ---       -----
//                                  |          |
//                                  |          |
//               querystring(string)["foo"]    |
//                                             |
//                          querystring(string)["hello"]

// We can now modify our onRequest function to add the logic needed to find out which
// URL path the browser requested.

var http = require('http');
var url  = require('url');

function start() {
  function onRequest(request, response) {
    var pathname = url.parse(request.url).pathname;
    console.log("Request for "+pathname+" received.");
    response.writeHead(200, {'Content-Type':'text/plain'});
    response.write('Hello World');
    response.end();
  }
  http.createServer(onRequest).listen(8888);
  console.log("Server has started.");
}

exports.start = start;

// In terms of this application, we only need to catch requests for /start and /upload URLs.

// Lets start writing out router.

function route(params) {
  console.log("About to route a request for "+pathname);
}

exports.route = route;

// We correct our index.js to have access to this module and implement it
// within our server.js

// Functional programming should use verbs not nouns. Surely, you knew that..
// right? RIGHT?! CMON!!!1

// Lets create some request handlers that the router can pass requests into.

function start() {
  console.log("Request handler 'start' was called.");
}

function upload() {
  console.log("Request handler 'upload' was called.");
}

exports.start = start;
exports.upload = upload;

// This allows us to wire the request handlers into the router, giving our
// router something to route to.

// We need to tackle the issue of passing various number of request handlers and handling
// the logic in a different area. We will need to pass request handlers
// to the router. This seems a bit dirty so instead we will pass the request handlers to
// the server which will then pass them onto the router.

// We edit the index.js file to allow us to pass requestHandlers and urls to capture into our
// HTTP server.

var server = require("./server");
var router = require("./router");
var requestHandlers = require("./requestHandlers");

var handle = {}
handle["/"] = requestHandlers.start;
handle["/start"] = requestHandlers.start;
handle["/upload"] = requestHandlers.upload;

server.start(router.route, handle);

// Handle is a collection of URLS(key) mapped to functions within our request handlers module.

// Now we nee to ensure our server knows what to do with these request handlers mappings.

var http = require("http");
var url = require("url");

function start(route, handle) {
  function onRequest(request, response) {
    var pathname = url.parse(request.url).pathname;
    console.log("Request for " + pathname + " received.");

    route(handle, pathname);

    response.writeHead(200, {"Content-Type": "text/plain"});
    response.write("Hello World");
    response.end();
  }

  http.createServer(onRequest).listen(8888);
  console.log("Server has started.");
}

exports.start = start;

// Finally, we need to ensure that our router knows what to do with the handlers.

function route(handle, pathname) {
  console.log("About to route a request for " + pathname);
  if (typeof handle[pathname] === 'function') {
    handle[pathname]();
  } else {
    console.log("No request handler found for " + pathname);
  }
}

exports.route = route;

// We check for the pathname, pulled from the URL within our request mapping object.
// If its available then we ensure that value is a function and call it. If not, we
// print out to STDOUT that we were unable to find a request handler.

// The use of 'verbs' shines here when you view the line handle[pathname]()
// which can translate to - "Please handle this pathname".


// ## Making the request handlers respond

// Now we need to make our request handler functions respond.
// Initial thought is to return a string to use as the HTTP resonse body.

// The issues with this is that you quickly run into issues when you want to make use
// of a non-blocking operating in the future.

// Node.js is single threaded. Meaning that if you have a blocking operation within a request that
// other requests will be delayed until the script has time to complete them after finishing
// the blocking operation.

// Understanding the node.js event loop (http://blog.mixu.net/2011/02/01/understanding-the-node-js-event-loop/)
// provides a good look into how this works.

// An example:

var exec = require('child_process').exec;

function start() {
  console.log("Request handler 'start' was called.");
  // Create content that will be passed back as HTTP response body
  var content = "empty";
  // Execute shell command
  // We pass a callback function to be used.
  exec('ls -lah', function(error,stdout,stderr) {
    content = stdout;
  });
  return content;
}

// We have introduced a non-blocking operation(exec) into our request.
// This is a good thing because we now no longer block other requests made to our server and we can
// execute expensive shell operations without forcing our application to a stop.

// Unfortunately we are not getting returns the results of our directory listing. Let's fix this...

// Exec is passed a callback function which sets our content variable to the output from the shell command.
// Here lies the root of our problem.

// Exec is executed synchronous, which means that once exec() is called our method continues to execute 'return content'.
// Content is still set to "empty" at this stage.

// ### Responding request handlers with non-blocking operations

// We will change how the response is constructed. We will no longer pass the content to the server, but instead
// pass the server to the content.

// We modify server.js to pass the response object to our router

var http = require("http");
var url = require("url");

function start(route, handle) {
  function onRequest(request, response) {
    var pathname = url.parse(request.url).pathname;
    console.log("Request for " + pathname + " received.");

    route(handle, pathname, response);
  }

  http.createServer(onRequest).listen(8888);
  console.log("Server has started.");
}

exports.start = start;

// Then modify the router to pass the response object through to the requests.
// We create the response when no route is found.

function route(handle, pathname, response) {
  console.log("About to route a request for " + pathname);
  if (typeof handle[pathname] === 'function') {
    handle[pathname](response);
  } else {
    console.log("No request handler found for " + pathname);
    response.writeHead(404, {"Content-Type": "text/plain"});
    response.write("404 Not found");
    response.end();
  }
}

exports.route = route;

// We then get to our request handlers and use the response object.
// We change the request handlers to accept the response parameter.

var exec = require("child_process").exec;

function start(response) {
  console.log("Request handler 'start' was called.");

  exec("ls -lah", function (error, stdout, stderr) {
    response.writeHead(200, {"Content-Type": "text/plain"});
    response.write(stdout);
    response.end();
  });
}

function upload(response) {
  console.log("Request handler 'upload' was called.");
  response.writeHead(200, {"Content-Type": "text/plain"});
  response.write("Hello Upload");
  response.end();
}

exports.start = start;
exports.upload = upload;

// We are now able to handle multiple requests and not having any issues.
// Now we just need to add some value, we need to handle POST requests

// ### Handling POST Requests

// We will keep this simple and present a textarea to the user that can be filled and sent
// to the server in a POST request. Once received we will display the content of the textarea.

// We modify our start request handler by adding our textarea.

function start(response) {
  console.log("Request handler 'start' was called.");

  var body = '<html>'+
    '<head>'+
    '<meta http-equiv="Content-Type" content="text/html; '+
    'charset=UTF-8" />'+
    '</head>'+
    '<body>'+
    '<form action="/upload" method="post">'+
    '<textarea name="text" rows="20" cols="60"></textarea>'+
    '<input type="submit" value="Submit text" />'+
    '</form>'+
    '</body>'+
    '</html>';

    response.writeHead(200, {"Content-Type": "text/html"});
    response.write(body);
    response.end();
}

// For the sake of this tutorial we will not include abstraction of views and logic.

// We now need to handle the POST request in a non-blocking fashion. Node.js servers the POST data
// in small chunks to callbacks that we specify in our code.
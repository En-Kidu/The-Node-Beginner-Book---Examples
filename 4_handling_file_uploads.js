// # 4. Handling File Uploads

// To handle file uploads we will use node-formidable by Felix Geisendörfer
// It abstracts all the nasty details about parsing incoming file POST data.

// To get started we need to install a new external node.js library with 'npm install formidable'

// We can require this module using the following:

var formidable = require('formidable');

// The example code from the node-formidable project page shows us how
// to play with different parts together.

var formidable = require('formidable'),
          http = require('http'),
           sys = require('sys');
           
http.createServer(function(req, res) {
  if (req.url == '/upload' && req.method.toLowerCase() == 'post') {
    // parse a file upload
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
      res.writeHead(200, {'content-type': 'text/plain'});
      res.write('received upload:\n\n');
      res.end(sys.inspect({fields: fields, files: files}));
    });
    return;
  }
 
  // show a file upload form
  res.writeHead(200, {'content-type': 'text/html'});
  res.end(
    '<form action="/upload" enctype="multipart/form-data" '+
    'method="post">'+
    '<input type="text" name="title"><br>'+
    '<input type="file" name="upload" multiple="multiple"><br>'+
    '<input type="submit" value="Upload">'+
    '</form>'
  );
}).listen(8888);

// This code will allow us to inspect the files object, which is passed to the
// callback defined in the form.parse call, is structured.

// received upload:
// 
// { fields: { title: '' },
//   files: 
//    { upload: 
//       { size: 1658,
//         path: '/tmp/676c94dd35ee3c2738e3041f9eed177b',
//         name: 'my_little.pony',
//         type: 'application/octet-stream',
//         lastModifiedDate: Wed, 24 Aug 2011 04:03:24 GMT,
//         _writeStream: [Object],
//         length: [Getter],
//         filename: [Getter],
//         mime: [Getter] } } }

// We need to include the form parsing logic of formidable into our code structure, as well
// as how to server the content of the upload file(saved to /tmp folder) to a requesting browser.

// We will tackle the last issue first.
// To serve a file we obviously need to read the files contents first. We can do this with
// the included node.js module - fs.

var fs = require('fs');

// We add another request handler to our application that will show the contents of an image file.

var querystring = require("querystring"),
    fs = require("fs");

function start(response, postData) {
  console.log("Request handler 'start' was called.");

  var body = '<html>'+
    '<head>'+
    '<meta http-equiv="Content-Type" '+
    'content="text/html; charset=UTF-8" />'+
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

function upload(response, postData) {
  console.log("Request handler 'upload' was called.");
  response.writeHead(200, {"Content-Type": "text/plain"});
  response.write("You've sent the text: "+
  querystring.parse(postData).text);
  response.end();
}

function show(response, postData) {
  console.log("Request handler 'show' was called.");
  fs.readFile("/tmp/test.png", "binary", function(error, file) {
    if(error) {
      response.writeHead(500, {"Content-Type": "text/plain"});
      response.write(error + "\n");
      response.end();
    } else {
      response.writeHead(200, {"Content-Type": "image/png"});
      response.write(file, "binary");
      response.end();
    }
  });
}

exports.start = start;
exports.upload = upload;
exports.show = show;

// We also need to map the new request handler to the url /show in file index.js

var server = require("./server");
var router = require("./router");
var requestHandlers = require("./requestHandlers");

var handle = {}
handle["/"] = requestHandlers.start;
handle["/start"] = requestHandlers.start;
handle["/upload"] = requestHandlers.upload;
handle["/show"] = requestHandlers.show;

server.start(router.route, handle);

// Now if we spin up the server at /show we will be presented with the image
// saved at  /tmp/test.png.

// All we need now is the following:

// Add a file upload element to the form which is served at /start
// Integrate node-formidable into the upload request handler, in order
// to save the uploaded file to /tmp/test.png
// Embed the uploaded image into the HTML output of the /upload URL

// Adding the file upload element to the form is simple. We simply change the
// output from our /start request handler.

function start(response) {
  console.log("Request handler 'start' was called.");
  
  var body = '<html>'+
      '<head>'+
      '<meta http-equiv="Content-Type" content="text/html; '+
      'charset=UTF-8" />'+
      '</head>'+
      '<body>'+
      '<form action="/upload" enctype="mutlipart/form-data" method="post">'+
      '<input type="file" name="upload"><br />'+
      '<input type="submit" value="Submit text" />'+
      '</form>'+
      '</body>'+
      '</html>';
  
  response.writeHead(200, {'Content-Type':'text/html'});
  response.write(body);
  response.end();
}

// The next step is a little more complex. We want to handle the file upload in our
// .upload request handler. We will need to pass the request object to the form.parse
// call of node-formidable.

// First we remove our postData, as we no longer need it and pass our request object
// through to the router.

function onRequest(request, response) {
  var pathname = url.parse(request.url).pathname;
  console.log("Request for "+pathname+" received.");
  route(handle, pathname, response, request);
}

// Then we pass the request object from our router through to our request handlers.

function route(handle,pathname, response, request) {
  console.log("About to route a request for "+pathname);
  
  if (typeof handle[pathname] === 'function') {
    handle[pathname](response,request);
  } else {
    console.log("No request handler found for "+pathname);
    response.writeHead(404, {'Content-Type':'text/plain'});
    response.write('404 Not found');
    response.end();
  }
}

// Now we can use the request object within our upload request handler function.

// Node-formidable will handle saving the file to /tmp/. We just need to ensure that it
// saves with the correct filename (test.png).

// We use fs.renameSync(path1,path2) for this. It is a synchronous operation which means
// that if the operation takes a long time it will block other operations. Be careful.

// We now correct our request handlers file.

var querystring = require("querystring"),
    fs = require("fs"),
    formidable = require("formidable");

function start(response) {
  console.log("Request handler 'start' was called.");

  var body = '<html>'+
    '<head>'+
    '<meta http-equiv="Content-Type" content="text/html; '+
    'charset=UTF-8" />'+
    '</head>'+
    '<body>'+
    '<form action="/upload" enctype="multipart/form-data" '+
    'method="post">'+
    '<input type="file" name="upload" multiple="multiple">'+
    '<input type="submit" value="Upload file" />'+
    '</form>'+
    '</body>'+
    '</html>';

    response.writeHead(200, {"Content-Type": "text/html"});
    response.write(body);
    response.end();
}

function upload(response, request) {
  console.log("Request handler 'upload' was called.");

  var form = new formidable.IncomingForm();
  console.log("about to parse");
  form.parse(request, function(error, fields, files) {
    console.log("parsing done");
    fs.renameSync(files.upload.path, "/tmp/test.png");
    response.writeHead(200, {"Content-Type": "text/html"});
    response.write("received image:<br/>");
    response.write("<img src='/show' />");
    response.end();
  });
}

function show(response) {
  console.log("Request handler 'show' was called.");
  fs.readFile("/tmp/test.png", "binary", function(error, file) {
    if(error) {
      response.writeHead(500, {"Content-Type": "text/plain"});
      response.write(error + "\n");
      response.end();
    } else {
      response.writeHead(200, {"Content-Type": "image/png"});
      response.write(file, "binary");
      response.end();
    }
  });
}

exports.start = start;
exports.upload = upload;
exports.show = show;

// There we go!
// We use formidable to parse the postData and save to tmp
// We then use renameSync to rename the uploaded file to /tmp/test.png".
// Finally we return the image using our /show request handler

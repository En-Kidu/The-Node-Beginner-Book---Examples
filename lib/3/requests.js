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

function upload() {
  console.log("Request handler 'upload' was called.");
  return "Hello upload";
}

exports.start = start;
exports.upload = upload;
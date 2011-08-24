var server = require('./server');
var router = require('./router');
var requests = require('./requests');

var handle = {};
handle["/"] = requests.start;
handle["/start"] = requests.start;
handle["/upload"] = requests.upload;

server.start(router.route,handle);
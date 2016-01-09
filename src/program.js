var request = require('request');
var tutumReader = require('./tutumReader');
var consulWriter = require('./consulWriter');

var containerApiUrl = "https://dashboard.tutum.co/api/v1/container";

// Check args
var args = process.argv;
if (args.length < 7) {
    console.error("Insufficient arguments. Usage: node program tutum_user tutum_api_token consul_host consul_port refresh_interval_ms");
    process.exit(1);
}

// Read args
var user = args[2];
var token = args[3];
var consulHost = args[4];
var consulPort = args[5];
var interval = args[6];

// Start processing
console.info("starting tutum-registrator. Tutum info: (%s, %s). Consul info: (%s:%d)", user, token, consulHost, consulPort);
setInterval(run, interval);

function run() {
    // Read stopped containers and deregister
    tutumReader.readContainers(containerApiUrl + "?state=Stopped&limit=1000", user, token, function (err, data) {
        if (err) return console.error("failed to read stopped containers: " + err);
        consulWriter.deregisterServices(consulHost, consulPort, data);
    });

    // Read stopped containers and deregister
    tutumReader.readContainers(containerApiUrl + "?state=Terminated&limit=1000", user, token, function (err, data) {
        if (err) return console.error("failed to read stopped containers: " + err);
        consulWriter.deregisterServices(consulHost, consulPort, data);
    });

    // Read running containers and register
    tutumReader.readContainers(containerApiUrl + "?state=Running&limit=1000", user, token, function (err, data) {
        if (err) return console.error("failed to read running containers: " + err);
        consulWriter.registerServices(consulHost, consulPort, data);
    });
}

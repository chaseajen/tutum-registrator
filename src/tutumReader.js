// Set module exports
module.exports = {
    readContainers: readContainers
};

// Requires
var request = require('request');

// Reads the containers from the API
function readContainers(url, user, token, callback) {
    request.get(url, { auth: { user: user, pass: token, sendImmediately: false } }, function (err, response, body) {
        // Handle response
        if (err) callback(err, null);
        if (response.statusCode != 200) callback(response.statusCode, null);
        
        // Process the body
        processResponseBody(body, callback);
    });
}

    // Process the raw response from the tutum container API and create service objects from it
function processResponseBody(body, callback) {
    // Parse as JSON
    var data = JSON.parse(body);
    
    // Enumerate and generate services
    var results = [];
    for (var i = 0; i < data.objects.length; i++) {
        var container = data.objects[i];

        var containerName = container.name;
        var tutumServiceName = containerName.split('-')[0];
        
        // Get both the private IP and the public DNS
        var privateIp = container.private_ip;
        var publicDns = container.public_dns;
        
        // Enumerate the ports
        var ports = container.container_ports;
        for (var portIndex = 0; portIndex < ports.length; portIndex++) {
            var port = ports[portIndex];

            var published = port.published;
            var innerPort = port.inner_port;
            var outerPort = port.outer_port;

            var serviceName = tutumServiceName + "-" + innerPort;

            // Create the service object
            var service = {
                id: containerName + "-" + serviceName,
                name: serviceName,
                container: containerName,
                published: published
            };
            
            // Assign the address and port dependent on whether it's published
            if (published) {
                service.address = publicDns;
                service.port = outerPort;
            }
            else {
                service.address = privateIp;
                service.port = innerPort;
            }

            // Add the service to the results
            results.push(service);
        }
    }

    callback(null, results);
}
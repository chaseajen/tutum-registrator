// Set module exports
module.exports = {
    registerServices: registerServices,
    deregisterServices: deregisterServices
};

// Registers the specified services in consul
function registerServices(consulHost, consulPort, services) {
    // Get consul
    var consul = require('consul')({ host: consulHost, port: consulPort });
    
    // Enumerate the services
    services.forEach(function (service) {
        // Check if the service already exists on any agent
        consul.catalog.service.nodes(service.name, function (err, data) {
            if (err) throw err;
            var hasService = data.some(function (item) { return item.ServiceID == service.id; });

            if (hasService) {
                console.info("service " + service.id + " already registered. Ignoring.");
                return;
            }

            // Register the service
            console.info("Registering service " + service.id + " to Consul");
            
            consul.agent.service.register({
                name: service.name,
                id: service.id,
                address: service.address,
                port: service.port,
                tags: ['auto-registered'],
            }, function (err) {
                // Handle error
                if (err) throw err;
            });
        });
    });
}

// Deregisters the specified services in consul
function deregisterServices(consulHost, consulPort, services) {
    // Get consul
    var consul = require('consul')({ host: consulHost, port: consulPort });
    
    // Enumerate the services
    services.forEach(function (service) {
        // Deregister the service by id, just in case
        consul.agent.service.deregister({ id: service.id }, function (err) {
            // Handle error
            if (err) throw err;
        });
    });
}
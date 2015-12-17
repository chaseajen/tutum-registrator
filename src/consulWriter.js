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
        // Register the service
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
        // // Deregister the service by id, just in case
        // consul.agent.service.deregister({ id: service.id }, function (err) {
        //     // Handle error
        //     if (err) throw err;

            
        // });
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
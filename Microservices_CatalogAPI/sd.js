var cfenv = require("cfenv");
var appEnv = cfenv.getAppEnv();

// Service Discovery Configurations
sdService = appEnv.getService("myServiceDiscovery");
var ttl = 300;
var serviceName = "Catalog";
var serviceHost = appEnv.bind;
var servicePort = "http"
var serviceUrl = appEnv.url

var ServiceDiscovery = require('bluemix-service-discovery');
var discovery = new ServiceDiscovery({ name: 'myServiceDiscovery', auth_token: sdService.credentials.auth_token, url: sdService.credentials.url, version: 1 });

// register a service and send heartbeats
discovery.register({
  "service_name": serviceName,
  "ttl": ttl,
  "status": "UP",
  "endpoint": {
    "type": servicePort,
    "value": serviceUrl
    //"host": serviceHost,
    //"port": servicePort
  },
  "metadata": {"url": serviceUrl }
}, function(error, response, service) {
  if (!error) {
    var intervalId = setInterval(function() {
      discovery.renew(service.id, function(error, response, service) {
        if (error || response.statusCode !== 200) {
          console.log('Could not send heartbeat, trying one more time');
          discovery.renew(service.id, function(error, response, service) {
            if (error || response.statusCode !== 200) {
              console.log('Retry failed also. Giving up.')
            }
          }
          );
        }
      });
    }, ttl * 1000 * 0.75);
  }
});

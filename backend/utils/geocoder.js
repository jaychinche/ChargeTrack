const NodeGeocoder = require('node-geocoder');

const options = {
  provider: 'openstreetmap',
  httpAdapter: 'https', // Use HTTPS
  timeout: 5000, // 5 second timeout
  retry: 3, // Retry 3 times if request fails
  osmServer: 'https://nominatim.openstreetmap.org', // Official OSM server
 userAgent: process.env.OSM_USER_AGENT || 'EVChargingApp'
};

const geocoder = NodeGeocoder(options);

module.exports = geocoder;
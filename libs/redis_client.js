/**
 * Filename: redis_client.js
 */

import redis from 'redis';

import redis_config from '../config/redis_config.json';

const redis_client = new redis.createClient(
	{
		host: redis_config.host,
		port: redis_config.port,
		password: redis_config.password
	}
);

// Configure redis_client actions
redis_client.on('error', function(err) {
	console.log("Error " + err);
}); 

export default redis_client;

/**
 * Filename: redis_client.js
 */

import redis from 'redis';

import redis_config from './config/redis_config.json';

const redis_client = new redis.createClient(
	{
		host: redis_config.host,
		port: redis_config.port,
		password: redis_config.password
	}
);

export default redis_client;

/**
 * Filename: hash.js
 */
import redis from 'redis';

import redis_config from '../../config/redis_config.json';

export default class hash {
    constructor() {
    	this.key_prefix = "hash";
    	
    	this.redis_client = new redis.createClient(
    		{
    			host: redis_config.host,
    			port: redis_config.port,
    			password: redis_config.password,
    			retry_strategy: function (options) {
    		        if (options.error.code === 'ECONNREFUSED') {
    		            // End reconnecting on a specific error and flush all commands with a individual error 
    		            return new Error('The server refused the connection');
    		        }
    		        if (options.total_retry_time > 1000 * 60 * 60) {
    		            // End reconnecting after a specific timeout and flush all commands with a individual error 
    		            return new Error('Retry time exhausted');
    		        }
    		        if (options.times_connected > 10) {
    		            // End reconnecting with built in error 
    		            return undefined;
    		        }
    		        // reconnect after 
    		        return Math.max(options.attempt * 100, 3000);
    		    }    			
    		}
    	);

    	// Configure redis_client actions
    	this.redis_client.on('error', function(err) {
    		console.log("Redis cleint error. " + err);
    	}); 
    }

    /**
     * function create()
     */
	create(req, res) {
		
	}

	/**
	 * function get()
	 */
	get(req, res) {
		var redis_key = this.key_prefix + ":*:" + req.params.hash_value; 
		
		this.redis_client.keys(
			redis_key,
			function(err, reply) {
				if (err) { 
					res.json({ 
						"error": [{
							"status": 503,
							"title": "Cant connect to external server",
							"detail": "Redis server is not available"
						}]
					});
				} else {
					if(reply.length == 1) {
						var redis_key_parts = reply[0].split(":");					
						res.json({ 
							"success": true,
							"email": redis_key_parts[1],
							"message": "This is valis hash"
						});
					} else {
						res.json({ 
							"success": false,
							"message": "Cant find hash"
						});
					}
				}
				
			}
		);
	}
	
	/**
	 * function revoke()
	 */
	revoke(req, res) {
		res.json({ action: "revoke" });
	}
}


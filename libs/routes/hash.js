/**
 * Filename: hash.js
 */
import redis from 'redis';

import api_response from '../../classes/api_response';

import redis_config from '../../config/redis_config.json';

export default class hash {
	
    constructor() {
    	this.key_prefix = "hash";
    	
    	this.redis_client = new redis.createClient(
    		{
    			host: redis_config.host,
    			port: redis_config.port,
    			password: redis_config.password		
    		}
    	);

    	// Configure redis_client actions
    	this.redis_client.on('error', function(err) {
    		console.log("Redis cleint error. " + err);
    	}); 
    }

    /**
     * function create()
     * 
     * Create hash in redis db. Payload pass in POST.
     * 
     */
	create(req, res) {
		console.log(req.body);
		res.end();
	}

	/**
	 * function get()
	 */
	get(req, res) {
		var redis_key = this.key_prefix + ":*:" + req.params.hash_value; 
		
		this.redis_client.keys(
			redis_key,
			function(err, reply) {
				var api_response_obj = new api_response();

				if (err) { 
					api_response_obj.add_error(
						1,
						"Cant connect to external server",
						503,
						"Redis server is not available"
					);
				} else {
					if(reply.length == 1) {
						var redis_key_parts = reply[0].split(":");
						api_response_obj.set_data({ 
							"success": true,
							"email": redis_key_parts[1],
							"message": "This is valis hash"
						});
					} else {
						api_response_obj.set_data({ 
							"success": false,
							"message": "Cant find hash"
						});
					}
				}

				res.json(api_response_obj.get());
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


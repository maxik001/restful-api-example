/**
 * Filename: hash.js
 */
import redis from 'redis';

import api_response from '../../classes/api_response';

import redis_config from '../../config/redis_config.json';

export default class hash {
	
    constructor() {
    	this.api_response = new api_response();

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
					this.api_response.add_error(
						1,
						"Cant connect to external server",
						503,
						"Redis server is not available"
					);
				} else {
					if(reply.length == 1) {
						var redis_key_parts = reply[0].split(":");
						this.api_response.set_data("trust");
						/*
						this.api_response.set_data({ 
							"success": true,
							"email": redis_key_parts[1],
							"message": "This is valis hash"
						});
						*/
					} else {
						/*
						this.api_response.set_data({ 
							"success": false,
							"message": "Cant find hash"
						});
						*/
					}
				}
				res.json(this.api_response.get());
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


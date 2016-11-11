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
    			password: redis_config.password
    		}
    	);

    	// Configure redis_client actions
    	this.redis_client.on('error', function(err) {
    		console.log("Error " + err);
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
				if(reply === 1) {
					res.json({ message: reply });
				} else {
					res.json({ message: err });
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


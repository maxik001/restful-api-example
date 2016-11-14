/**
 * Filename: hash.js
 */
import crypto from 'crypto';
import redis from 'redis';
import json_validator from 'payload-validator';

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
     * Secondary functions  
     */
    
    /**
     * function clear_hash_key()
     * 
     * key @string
     */
    clear_hash_keys(err, replies) {
    	if(replies.length > 0) {
    		replies.forEach(
    			function(key) { this.redis_client.del(key); }
    		);
		}
    }
    
    create_hash_key(key) {
		this.redis_client.set(
			key,
			"1",
			function(err, reply) {
				var api_response_obj = new api_response();
				
				if (err) { 
					this.response_redis_is_not_available();
				} else {
					api_response_obj.set_data({ 
						"message": "Use this hash to validate registration",
						"hash": hash_value
					});						
				}
				res.status(201).json(api_response_obj.get());
				res.end();
			}    	
		);
    }
    
    /**
     * function process_hash_key_set()
     * 
     * email @string
     */
    process_hash_key_set(email) {
    	// Clear all keys matched with this email
    	const key_pattern = this.key_prefix+":"+email+":*";
    	
		this.redis_client.keys(key_pattern,	this.clear_hash_keys(err, replies));
    	
		// Create new key
		
		this.redis_client.set(
			key_pattern,
			"1",
			function hash_key_set_result(err, reply) {
				var api_response_obj = new api_response();
				
				if (err) { 
					this.response_redis_is_not_available();
				} else {
					api_response_obj.set_data({ 
						"message": "Use this hash to validate registration",
						"hash": hash_value
					});						
				}
				res.status(201).json(api_response_obj.get());
				res.end();
			}
		);
    }
    
    response_redis_is_not_available() {
    	var api_response_obj = new api_response();

    	api_response_obj.add_error(
			1,
			"Cant connect to external server",
			503,
			"Redis server is not available"
		);
    	res.json(api_response_obj.get());
    	res.end();
    }
    
    
    /**
     * Primary funcions
     */
    
    /**
     * function create()
     * 
     * Create hash in redis db. Payload pass in POST.
     * 
     */
	create(req, res) {
		if(!req.body.data) {
			res.status(422);
			res.end();
			return;
		}
		
		var expected_payload = { "email": "" };
		var mandatory_elements = ["email"];
		
		var validate_result = json_validator.validator(
			req.body.data,
			expected_payload,
			mandatory_elements,
			false
		);
		
		if(validate_result.success) {
			// const hash_value = crypto.randomBytes(64).toString('hex'); 
			// const key_name = this.key_prefix + ":"+req.body.data['email']+":" + hash_value;

			this.process_hash_key_set(req.body.data['email']);
		} else {
			res.status(422);
			res.end();
		}
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
					this.response_redis_is_not_available();
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
		
		var redis_key = this.key_prefix + ":maxgusev@gmail.com:*";
		
		this.redis_client.keys(
			redis_key,
			function(err, replies) {
				if(replies.length > 0) {
					
				}
				res.json(replies);
			}
		);

		
	}
}


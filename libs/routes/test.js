/**
 * Filename: test.js
 */

import crypto from 'crypto';
import redis from 'redis';
import json_validator from 'payload-validator';

import api_response from '../../classes/api_response';

import redis_client from '../redis_client';

import hash_config from '../../config/hash_config.json';

/**
 * Exported functions
 */
export function create(req, res) {
	// Validate input attributes
	if(!req.body.data) {
		res.status(422).end();
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

	// Process
	if(validate_result.success) {
    	// Clear all keys matched with this email
    	const key_pattern = this.key_prefix+":"+req.body.data['email']+":*";
    	
		redis_client.keys(key_pattern, redis_keys_del);
		
		// Create new key
		const hash_value = crypto.randomBytes(64).toString('hex'); 
		const new_key = this.key_prefix+":"+req.body.data['email']+":"+hash_value;
		
		redis_client.set(new_key, "1",	function(err, reply) {
				var api_response_obj = new api_response();
				
				if (err) { 
			    	response503();				
				} else {
					// Set key expire
					redis_client.expire(
						new_key, 
						hash_config.expire,
						function(err, reply) {
							var api_response_obj = new api_response();
							
							if (err) { 
						    	response503();				
							}
						}
					);				
					
					api_response_obj.set_data({ 
						"message": "Use this hash to validate registration",
						"hash": hash_value
					});						
				}
				res.status(201).json(api_response_obj.get());
				res.end();
			}
		);
	} else {
		res.status(422).end();
	}
	
	// Additional functions
	function redis_keys_del(err, replies) {
    	if(replies.length > 0) {
    		replies.forEach(
    			function(key) { redis_client.del(key); }
    		);
		}
	}

}

export function get(req, res) {
	var redis_key = this.key_prefix + ":*:" + req.params.hash_value; 
	
	redis_client.keys(redis_key, redis_answer_handle);
	
	// Additional functions
	function redis_answer_handle(err, reply) {
		var api_response_obj = new api_response();

		if (err) {
	    	response503();
		} else {
			if(reply.length == 1) {
				var redis_key_parts = reply[0].split(":");
				api_response_obj.set_data({ 
					"success": true,
					"email": redis_key_parts[1],
					"message": "This is valid hash"
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
}

export function revoke(req, res) {
	// Validate input attributes
	if(!req.body.data) {
		res.status(422).end();
		return;
	}
	
	var expected_payload = {"email": "", "hash": "" };
	var mandatory_elements = ["email", "hash"];
	
	var validate_result = json_validator.validator(
		req.body.data,
		expected_payload,
		mandatory_elements,
		false
	);
	
	// Process
	if(validate_result.success) {
		const redis_key = this.key_prefix+":"+req.body.data['email']+":"+req.body.data['hash'];
		
		redis_client.del(redis_key); 
		
		res.status(200);
	} else {
		res.status(422);
	}
	
	res.end();
}

/**
 * Other functions
 */
function response503() {
	var api_response_obj = new api_response();

	api_response_obj.add_error(
		1,
		"Cant connect to external server",
		503,
		"Redis server is not available"
	);
   	res.json(api_response_obj.get());
   	res.status(200).end();						
}
	

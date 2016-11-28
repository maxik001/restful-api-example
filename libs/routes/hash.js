/**
 * Filename: hash.js
 */

import crypto from 'crypto';
import fs from 'fs';
import hogan from 'hogan.js';
import json_validator from 'payload-validator';
import nodemailer from 'nodemailer';
import redis from 'redis';
import sendmailTransport from 'nodemailer-sendmail-transport';

import api_response from '../../classes/api_response';

import redis_client from '../redis_client';

import api_client_config from '../../config/api_client_config.json';
import hash_config from '../../config/hash_config.json';
import notification_config from '../../config/notification_config.json';

/**
 * Exported functions
 */
function create(req, res) {
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
    	const key_pattern = get_key_prefix()+":"+req.body.data['email']+":*";
    	
		redis_client.keys(key_pattern, redis_keys_del);
		
		// Create new key
		const hash_value = crypto.randomBytes(16).toString('hex'); 
		const new_key = get_key_prefix()+":"+req.body.data['email']+":"+hash_value;
		
		redis_client.set(new_key, "1",	function(err, reply) {
			if (err) { res.status(503).end(); } 
				
			// Set key expire
			redis_client.expire(
				new_key, 
				hash_config.expire,
				function(err, reply) {
					if (err) { res.status(503).end(); }
				}
			);				
			
			mail_hash(req.body.data['email'], hash_value);
			
			res.status(202).end();
		});
		
	} else {
		res.status(422).end();
	}
	
	// Additional functions
	
	/**
	 * Mail hash to mailbox
	 */
	function mail_hash(email, hash) {
		// HTML+CSS to InLine http://foundation.zurb.com/emails/inliner-v2.html
		// HTML Template https://github.com/mailgun/transactional-email-templates
		// Template Engine http://twitter.github.io/hogan.js/
		
		// Mail transport
		var transporter = nodemailer.createTransport(sendmailTransport({path: '/usr/sbin/sendmail'}));
		
		// Main template
		var mailTemplate = fs.readFileSync('./hjs/reg_confirm.hjs', 'utf-8');
		const compiledMailTemplate = hogan.compile(mailTemplate);
		
		// Some data
		const siteName = api_client_config.protocol + "://" + api_client_config.baseDomain;
		const regLink = siteName + "/reg/validate/" + hash;
		
		var mailOptions = {
			from: notification_config.replyTo,
			to: email,
			subject: 'Регистрация на сайте ' + api_client_config.baseDomain,
			html: compiledMailTemplate.render({site: siteName, link: regLink})
		}
		
		transporter.sendMail(mailOptions, function(error, info){
		    if(error){
		        console.log(error);
		    } else {
		        console.log('Message sent: ' + info);
		    };
		});
		
	}
	
	/**
	 * Clear all keys in redis 
	 */
	function redis_keys_del(err, replies) {
    	if(replies.length > 0) {
    		replies.forEach(
    			function(key) { redis_client.del(key); }
    		);
		}
	}

}

function get(req, res) {
	var redis_key = get_key_prefix() + ":*:" + req.params.hash_value; 
	
	redis_client.keys(
		redis_key,
		function(err, reply) {
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
	);
}

function revoke(req, res) {
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
		const redis_key = get_key_prefix()+":"+req.body.data['email']+":"+req.body.data['hash'];
		
		redis_client.del(redis_key); 
		
		res.status(200);
	} else {
		res.status(422);
	}
	
	res.end();
}

function get_key_prefix() { return "hash"; }

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
	
export {create, get, revoke};

import joi from 'joi';
import json_validator from 'payload-validator';
import redis from 'redis';

import redis_client from '../redis_client';

import api_response from '../../classes/api_response';

function create(req, res, next) {
	
	validateBody().then(function(resolve, reject) {
		console.log('check is login exists');
		
		return new Promise(function(resolve, reject) {
			redis_client.hget('accounts:lookup:login', req.body.login, function(redis_error, redis_reply) {
				console.log("redis_reply", redis_reply);
				console.log("redis_error", redis_error);
				if(redis_error) { reject({status: '503'}); }
				else { 
					if(redis_reply != null) {
						reject({ code: '422', message: {code: '1', title: 'Value is not unique', detai: 'Check login field'}});
					} else { resolve(); }
				} 
			});
		});
	}).then(function() { 
		console.log('get new account id');
		
		return new Promise(function(resolve, reject) { 
			redis_client.incr('accounts:sequence', function(redis_error, redis_reply) {
				if(redis_error) { reject({status: '503'}); } 
				else { resolve(redis_reply); } 
			});
		});
	}).then(function(account_id) {
		console.log('create account in redis');
		console.log('account_id ', account_id);
		
		return new Promise(function(resolve, reject) {
			redis_client.hmset('accounts:'+account_id, ['login', req.body.login, 'password', req.body.password], function(redis_error, redis_reply) {
				if(redis_error) { reject({status: '503'}); } 
				else { resolve(account_id); } 
			});
		});
	}).then(function(account_id) {
		console.log('create lookup account record in redis');
		console.log('account_id ', account_id);
		
		return new Promise(function(resolve, reject) {
			redis_client.hset('accounts:lookup:login', req.body.login, account_id, function(redis_error, redis_reply) {
				if(redis_error) { reject({status: '503'}); } 
				else { resolve(); } 
			});
		});
	}).then(function() {
		res.status(201).end();
	}).catch(function(error) {
		console.log("error: ", error);
		
		switch(error.code) {
			case "422": {
				
				if(error) {
					var api_response_obj = new api_response();
					api_response_obj.set_data(error.message);
					res.status(422).json(api_response_obj.get());
				}
				
				res.status(422).end();
				break;
			} 
			case "503": {
				res.status(503).end();
				break;
			}
			default: {
				res.status(500).end();
			}
		}
	});
	
	function validateBody() {
		console.log('validate body');
		return new Promise(function(resolve, reject) {
			// Validate input attributes
			var bodySchema = joi.object().keys({
				login: joi.string().email().required(),
				password: joi.string().required()
			}).with('login', 'password');

			joi.validate(req.body, bodySchema, function(err, value) {
				if(err) { reject({code:'422'}); } 
				else { resolve(); }
			});
		});
	}
}

export {create};
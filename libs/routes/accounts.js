import joi from 'joi';
import jwt from 'jsonwebtoken';
import md5 from 'md5';
import redis from 'redis';

import api_response from '../../classes/api_response';

import redis_client from '../redis_client';

import jwt_config from '../../config/jwt_config.json';

function create(req, res) {
	
	validateBody().then(function() {
		return new Promise(function(resolve, reject) {
			Promise.all([
	             isLoginUnique(req.body.login),
	             isNicknameUnique(req.body.nickname)
	        ]).then(function(results) { 
	        	resolve();
	        }).catch(function(error) { 
	        	reject(error);
	        });
		});
	}).then(function() { 
		return new Promise(function(resolve, reject) { 
			redis_client.incr('accounts:sequence', function(redis_error, redis_reply) {
				if(redis_error) { reject({status: '503'}); } 
				else { resolve(redis_reply); } 
			});
		});
	}).then(function(account_id) {
		return new Promise(function(resolve, reject) {
			redis_client.hmset('accounts:'+account_id, ['login', req.body.login, 'nickname', req.body.nickname, 'password', md5(req.body.password)], function(redis_error, redis_reply) {
				if(redis_error) { reject({status: '503'}); } 
				else { resolve(account_id); } 
			});
		});
	}).then(function(account_id) {
		return new Promise(function(resolve, reject) {
			Promise.all([
	      		addLoginLookup(req.body.login, account_id),
	     		addNicknameLookup(req.body.nickname, account_id)
	         ]).then(function(results) {
	         	resolve(account_id);
	         }).catch(function(error) { 
	         	reject(error);
	         });
		});
	}).then(function(account_id) {
		// Generate JWT
		const payload = {
			id: account_id,
			iat: Math.floor(Date.now() / jwt_config.lifeTime)
		};
		var token = jwt.sign(payload, jwt_config.secret);
		
		const bodyData = {
			id: account_id,
			jwt: token
		};
		
		var api_response_obj = new api_response();
		api_response_obj.set_data(bodyData);

		res.status(201).json(api_response_obj.get()).end();
	}).catch(function(error) {
		console.log("catch error", error);
		switch(error.status) {
			case '422': {
				if(error.message) {
					var api_response_obj = new api_response();
					api_response_obj.set_data(error.message);
					res.status(422).json(api_response_obj.get());
				}
				
				res.status(422).end();
				break;
			} 
			case '503': {
				res.status(503).end();
				break;
			}
			default: {
				res.status(500).end();
			}
		}
	});
	
	/**
	 * Validate Body
	 */
	function validateBody() {
		return new Promise(function(resolve, reject) {
			// Validate input attributes
			var bodySchema = joi.object().keys({
				login: joi.string().email().required(),
				nickname: joi.string().required(),
				password: joi.string().required()
			}).with('login', 'nickname', 'password');

			joi.validate(req.body, bodySchema, function(err, value) {
				if(err) { reject({status:'422'}); } 
				else { resolve(); }
			});
		});
	}

	/**
	 * Lookup
	 */
	function addLoginLookup(login, account_id) {
		return new Promise(function(resolve, reject) {
			redis_client.hset('accounts:lookup:login', login, account_id, function(redis_error, redis_reply) {
				if(redis_error) { reject({status: '503'}); } 
				else { resolve(account_id); } 
			});
		});
	}
	
	function addNicknameLookup(nickname, account_id) {
		return new Promise(function(resolve, reject) {
			redis_client.hset('accounts:lookup:nickname', nickname, account_id, function(redis_error, redis_reply) {
				if(redis_error) { reject({status: '503'}); } 
				else { resolve(account_id); } 
			});
		});
	}

	/**
	 * isUnique
	 */
	function isLoginUnique(login) {
		return new Promise(function(resolve, reject) {
			redis_client.hget('accounts:lookup:login', login, function(redis_error, redis_reply) {
				if(redis_error) { reject({status: '503'}); }
				else { 
					if(redis_reply != null) {
						reject({status: '422', message: {code: '1', title: 'Value is not unique', detail: 'Check login field'}});
					} else { resolve(); }
				} 
			});
		});
	}
	
	function isNicknameUnique(nickname) {
        return new Promise(function(resolve, reject) {
			redis_client.hget('accounts:lookup:nickname', nickname, function(redis_error, redis_reply) {
				if(redis_error) { reject({status: '503'}); }
				else { 
					if(redis_reply != null) {
						reject({status: '422', message: {code: '2', title: 'Value is not unique', detail: 'Check nickname field'}});
					} else { resolve(); }
				} 
			});
		})   		
	}
}

function get(req, res) {
	res.status(200).end();
}

export {create, get};
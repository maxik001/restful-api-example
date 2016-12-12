import joi from 'joi';
import jwt from 'jsonwebtoken';
import md5 from 'md5';
import redis from 'redis';

import api_response from '../../classes/api_response';

import redis_client from '../redis_client';

import jwt_config from '../../config/jwt_config.json';

function auth(req, res) {
	validateBody().then(function() {
		return new Promise(function(resolve, reject) {
			redis_client.hget('accounts:lookup:login', req.body.login, function(redis_error, redis_reply) {
				if(redis_error) { reject({status: 503}); }
				else { 
					if(redis_reply == null) {
						reject({status: 200, message: {code: '0', title: 'Nothing to do', detail: ''}});
					} else { resolve(redis_reply); }
				} 
			});
		});
	}).then(function(account_id) {
		return new Promise(function(resolve, reject) {
			redis_client.hgetall('accounts:'+account_id, function(redis_error, redis_reply) {
				if(redis_error) { reject({status: 503}); }
				else { 
					if(redis_reply == null) {
						reject({status: 200, message: {code: '0', title: 'Nothing to do', detail: ''}});
					} else { redis_reply['id'] = account_id; resolve(redis_reply); }
				} 

			});
		});
	}).then(function(account_data) {
		
		console.log(account_data);

		
		const password_hash = md5(req.body.password);
		if(account_data.login == req.body.login && account_data.password == password_hash) {
			// Generate JWT
			const payload = {
				id: account_data.id,
				iat: Math.floor(Date.now() / jwt_config.lifeTime)
			};
			var token = jwt.sign(payload, jwt_config.secret);
			
			const bodyData = {
				id: account_data.id,
				jwt: token
			};
			
			var api_response_obj = new api_response();
			api_response_obj.set_data(bodyData);

			res.status(200).json(api_response_obj.get()).end();
		} else {
			throw {status: 200, message: {code: '0', title: 'Nothing to do', detail: ''}};
		}
	}).catch(function(error) {
		console.log("catch error", error);
		switch(error.status) {
			case 200: {}
			case 422: {
				if(error.message) {
					var api_response_obj = new api_response();
					api_response_obj.set_data(error.message);
					res.status(error.status).json(api_response_obj.get()).end();
				} else {
					res.status(error.status).end();	
				}
				break;
			} 
			case 503: {
				res.status(error.status).end();
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
				password: joi.string().required()
			}).with('login', 'password');

			joi.validate(req.body, bodySchema, function(err, value) {
				if(err) { reject({status: 422}); } 
				else { resolve(); }
			});
		});
	}
	
}

export {auth};
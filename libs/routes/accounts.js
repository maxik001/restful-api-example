import joi from 'joi';
import json_validator from 'payload-validator';
import redis from 'redis';

import redis_client from '../redis_client';

import api_response from '../../classes/api_response';

function create(req, res, next) {
	
	validateBody().then(function() {
		console.log('valid');
		
		var newP = new Promise();
		
		res.status(200).end();
	}).catch(function(error) {
		console.log('invalid');
		console.log(error);
		res.status(422).end();
	});
	
	function validateBody() {
		return new Promise(function(resolve, reject) {
			console.log("in promise");
			// Validate input attributes
			var bodySchema = joi.object().keys({
				id: joi.number().positive().required(),
				login: joi.string().email().required(),
				password: joi.string().required()
			}).with('id', 'login', 'password');

			joi.validate(req.body, bodySchema, function(err, value) {
				if(err) {
					var error = new Error();
					error.code = 422;
					reject(error); 
				} else { 
					resolve(); 
				}
			});
		});
	}
	
}

export {create};
import joi from 'joi';
import json_validator from 'payload-validator';
import redis from 'redis';

import redis_client from '../redis_client';

import api_response from '../../classes/api_response';

function create(req, res, next) {
	// Validate input attributes
	var bodySchema = joi.object().keys({
		id: joi.number().positive().required(),
		login: joi.string().email().required(),
		password: joi.string().required()
	}).with('id', 'login', 'password');

	var isBodyValid = new Promise(function(resolve, reject) {
		joi.validate(req.body, bodySchema, function(err, value) {
			if(err) { reject(); } else { resolve(); }
		});
	});
	
	isBodyValid.then(function() {
		console.log('valid');
		
		var newP = new Promise(function(resolve, reject){ re(); });
		
		res.status(200).end();
	}).catch(function() {
		console.log('invalid');
		res.status(422).end();
	});
}

export {create};
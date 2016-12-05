import joi from 'joi';
import json_validator from 'payload-validator';
import redis from 'redis';

import redis_client from '../redis_client';

import api_response from '../../classes/api_response';

function create(req, res) {
	// Validate input attributes

	var bodySchema = joi.object().keys({
		id: joi.number().positive().required(),
		login: joi.string().email().required(),
		password: joi.string().required()
	}).with('id', 'login', 'password');
	
	joi.validate(req.body, bodySchema, function(err, value) {
		if(err) {
			// Need some more log in future
			// console.log("err=", err); console.log("value=", value);	
			res.status(422).end();
		}
		 
	});
	

	res.status(200).end();
}

export {create};
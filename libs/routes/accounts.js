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

	var p = new Promise(function(resolve, reject) {
		joi.validate(req.body, bodySchema, function(err, value) {
			if(err) { reject("1"); } else { resolve("2"); }
			
		});
	});
	
	console.log(p);
	
	p.then(function() {
		console.log("then");
	}).catch(function() {		
		console.log("catch");
	});
	
	
	res.status(200).end();
/*
	console.log(p);
	
	joi.validate(req.body, bodySchema, createAccount);
	
	redis_client.incr("accounts:sequence", createAccount);

	function createAccount(err, accountId) {
		if(!err) { console.log("1"); res.status(503).end(); return 1; }
		console.log("err = ", err);
		console.log("new id = ", accountId);
	}
	
	res.status(200).end();
	*/
}

export {create};
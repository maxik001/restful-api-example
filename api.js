/**
 * Filename: api.js
 */

// Import
import express from 'express';
import json_validator from 'payload-validator';

import routes_index_func from './libs/routes/';

// Define routes
const router = express.Router();

const routes_index = routes_index_func();

// Test route
router.get(
	'/', 
	function (req, res) {
		res.json({ message: "Hello, World!"});
	}
);

// Hash
router.delete('/hash', routes_index.hash.revoke.bind(routes_index.hash) );
router.get('/hash/:hash_value', routes_index.hash.get.bind(routes_index.hash) );

router.post('/hash', function(req, res, next) {
	var expected_payload = { "email": "" };
	var mandatory_elements = ["email"];
	
	var validate_result = json_validator.validator(
		req.body,
		expected_payload,
		mandatory_elements,
		false
	);
	
	if(validate_result.success) {
		console.log("success");
	} else {
		console.log("fail");
	}

	next();
});
router.post('/hash', routes_index.hash.create.bind(routes_index.hash) );

export default router;

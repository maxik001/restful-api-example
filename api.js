/**
 * Filename: api.js
 */

// Import
import express from 'express';
import json_validator from 'payload-validator';

import routes_index_func from './libs/routes/index';

import * as test from './libs/routes/test';

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
/*
router.delete('/hash', routes_index.hash.revoke.bind(routes_index.hash) );
router.get('/hash/:hash_value', routes_index.hash.get.bind(routes_index.hash) );
router.post('/hash', routes_index.hash.create.bind(routes_index.hash) );
*/

// Test
router.delete('/hash', test.revoke );
router.get('/hash/:hash_value', test.get );
router.post('/hash', test.create );
/*
router.delete('/test', routes_index.test.revoke.bind(routes_index.hash) );
router.get('/test/:hash_value', routes_index.test.get.bind(routes_index.hash) );
router.post('/test', routes_index.test.create.bind(routes_index.hash) );
*/

export default router;

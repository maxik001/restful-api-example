/**
 * Filename: api.js
 */

// Import
import express from 'express';

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
router.post('/hash', routes_index.hash.create.bind(routes_index.hash) );

export default router;

/**
 * Filename: api.js
 */

// Import
import express from 'express';

// Define routes
const router = express.Router();

router.get(
	'/', 
	function (req, res) {
		res.json({ message: "Hello, World!"});
	}
);

export default router;

/**
 * Filename: api.js
 */

// Import
import express from 'express';
import json_validator from 'payload-validator';

import * as hash from './libs/routes/hash';

// Define routes
const router = express.Router();

// Hash
router.delete('/hash', hash.revoke );
router.get('/hash/:hash_value', hash.get );
router.post('/hash', hash.create );

export default router;

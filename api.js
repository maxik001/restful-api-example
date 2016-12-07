/**
 * Filename: api.js
 */

// Import
import express from 'express';
import json_validator from 'payload-validator';

import * as accounts from './libs/routes/accounts';
import * as hash from './libs/routes/hash';
import * as random from './libs/routes/random';

// Define routes
const router = express.Router();

// Accounts
router.post('/accounts', accounts.create);
router.get('/accounts/:id', accounts.get);

// Hash
router.delete('/hash', hash.revoke );
router.get('/hash/:hash_value', hash.get );
router.post('/hash', hash.create );

// Random
router.get('/random', random.get);
router.get('/random/:count', random.get);

export default router;

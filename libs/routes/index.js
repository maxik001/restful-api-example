/**
 * Filename: index.js
 */

import hash from './hash';

export default function(req, res) {
	return {
		hash : new hash()		
	};
}
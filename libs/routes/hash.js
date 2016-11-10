/**
 * Filename: routes.js
 */

export default class hash {
    constructor() {
    }

	create(req, res) {
		res.json({ action: "create" });
	}

	get(req, res) {
		const tmp = req.params.hash_value
		
		res.json({ message: "Hello, World!", hash : tmp });
	}
	
	revoke(req, res) {
		res.json({ action: "revoke" });
	}
}


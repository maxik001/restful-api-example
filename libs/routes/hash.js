/**
 * Filename: routes.js
 */

export default class hash {
    constructor() {
    }
	
	get(req, res) {
		const tmp = req.params.hash_value
		
		res.json({ message: "Hello, World!", hash : tmp });
	}
}

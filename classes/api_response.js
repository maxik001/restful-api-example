/**
 * Filename: api_response.js
 */

export default class api_response {
	constructor() {
		this.data = {};
		this.errors = [];
	}

	/**
	 * function add_error()
	 */
	add_error(code, title, status, detail=null) {
		var error_item = {"code": code, "title": title, "status": status }; 
		if(detail) error_item["detail"] = detail;
		
		this.errors.push(error_item);
	}
	
	/**
	 * function get()
	 */
	get() {
		return this.is_error()?this.errors:this.data;
	}
	
	/**
	 * function is_error()
	 */
	is_error() {
		return (this.errors.length>0)?true:false;
	}
	
	/**
	 * function set_data()
	 */
	set_data(data) {
		this.data['data'] = data;
	}
}
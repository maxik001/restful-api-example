import api_response from '../../classes/api_response';

function get(req, res) {
	// Presets
	const min_value = 0;
	const max_value = 100;
	const count_limit = 10;
	
	var rnd_values = [];
	
	// Foolproof
	var count = parseInt(req.params.count);
	if(isNaN(count) || count < 1) { count = 1; }

	if(count > count_limit) {
		res.status(422).end()	
	}

	// Generate rnd values
	for(var i=0;i<count;i++) { rnd_values.push(Math.floor(Math.random() * (max_value - min_value)) + min_value); }
	
	// Response
	var api_response_obj = new api_response();
	api_response_obj.set_data({"value": rnd_values});
	res.status(200).json(api_response_obj.get());
}

export {get};
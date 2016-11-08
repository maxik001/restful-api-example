/**
 * Filename: app.js
 */

import express from 'express';
import http from 'http';

import app_config from './config/app_config.json';

const app = express();

const http_server = http.createServer(app);

http_server.listen(
	app_config.server.port, 
	app_config.server.ip, 
	() => {
		console.log("Server ip : " + app_config.server.ip);
		console.log("Server port : " + app_config.server.port);
		console.log("Server is up!");
	}
);

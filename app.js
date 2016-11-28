/**
 * Filename: app.js
 */

// Import
import body_parser from 'body-parser';
import express from 'express';
import http from 'http';

import app_config from './config/app_config.json';

import api from './api';
import allowCros from './libs/cros';
import logger from './logger';

// Create app
const app = express();

// Configure body parsing middleware
app.use(body_parser.urlencoded({ extended: true }));
app.use(body_parser.json());

app.use(logger);

// CROS Allow
app.use(allowCros);

app.use('/', api);

// Create HTTP Server
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

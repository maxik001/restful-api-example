// Import
import body_parser from 'body-parser'
import express from 'express'
import http from 'http'

import configAPP from './config/config_app.json'

import api_router from './libs/api_router'
import allowCros from './libs/cros'
import loggerApp from './libs/logger_app'
import loggerHttp from './libs/logger_http'
import tokenDecode from './libs/token_decode'

// Create app
loggerApp.info('App start')
const app = express()

// Configure body parsing middleware
app.use(body_parser.urlencoded({ extended: true }))
app.use(body_parser.json())

app.use(loggerHttp)

// CROS Allow
app.use(allowCros)

// Token Decode
app.use(tokenDecode)

app.use('/', api_router)

// Create HTTP Server
const http_server = http.createServer(app)

http_server.listen(
  configAPP.server.port,
  configAPP.server.ip,
  () => {
    console.log('Server ip : ' + configAPP.server.ip)
    console.log('Server port : ' + configAPP.server.port)
    console.log('Server is up!')
  }
)

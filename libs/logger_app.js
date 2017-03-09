import fs from 'fs'
import path from 'path'
import winston from 'winston'

import config from '../config/config_logger_app.json'

const filename = path.join(config.access.path, config.access.filename)

var logger = new(winston.Logger)({
  transports: [
    new (winston.transports.File)({ filename: filename, json: false })
  ]
})

export default logger
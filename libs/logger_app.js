import fs from 'fs'
import path from 'path'
import winston from 'winston'

import configAPP from '../config/config_app.json'
import config from '../config/config_logger_app.json'

const filename = path.join(config.access.path, config.access.filename)

var logger = new(winston.Logger)({
  level: configAPP.log.level,
  transports: [
    new (winston.transports.File)({ filename: filename, json: false })
  ]
})

export default logger
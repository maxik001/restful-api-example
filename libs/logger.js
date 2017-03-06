import fs from 'fs'
import morgan from 'morgan'
import path from 'path'

import logger_config from '../config/logger_config.json'

// Create logger
const filename = path.join(logger_config.access.path, logger_config.access.filename)
var stream = fs.createWriteStream(filename, {flags: 'a'})

var logger = morgan('tiny', {stream: stream}) // The minimal output: :method :url :status :res[content-length] - :response-time ms

export default logger

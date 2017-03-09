import fs from 'fs'
import morgan from 'morgan'
import path from 'path'

import config from '../config/config_logger_http.json'

// Create logger
const filename = path.join(config.access.path, config.access.filename)
var stream = fs.createWriteStream(filename, {flags: 'a'})

const outputFormat = ':date[iso] :remote-addr :method :url :status :res[content-length] - :response-time ms'
var logger = morgan(outputFormat, {stream: stream}) 

export default logger

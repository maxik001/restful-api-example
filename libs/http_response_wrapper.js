import loggerApp from './logger_app'

export default function(res, objError) {
  
  loggerApp.warn('http_response_wrapper')
  loggerApp.warn(objError)
  
  switch(objError.status) {
    case '404': {
      res.status(404).end()
      break;
    } 
    case '422': {
      res.status(422).end()
      break;
    } 
    case '503': {
      res.status(503).end()
      break;
    }
    default: {
      res.status(500).end()
    }
  }
  return
}
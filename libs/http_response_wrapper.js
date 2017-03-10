import loggerApp from './logger_app'

export default function(res, objError) {
  // Catch exceptions and errors
  
  console.log('wrapper')
  
  loggerApp.info(objError)
  
  switch(objError.status) {
    case '404': {
      res.status(404).end()
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
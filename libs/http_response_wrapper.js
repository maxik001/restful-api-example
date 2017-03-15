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
      var resBody = {
        status: 422,
        title: objError.title?objError.title:'',
        detail: objError.detail?objError.detail:''
      }
      res.status(422).json(resBody).end()
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
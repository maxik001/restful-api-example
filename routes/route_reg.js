import joi from 'joi'

import httpResWrapper from '../libs/http_response_wrapper'
import loggerApp from '../libs/logger_app'

function createAccount(req, res) {
  loggerApp.debug('route_reg.createAccount')
}

function doPreReg(req, res) {
  loggerApp.debug('route_reg.doPrereg')

  validateBody(req.body).then(function() {
    
  }).catch(function(error) { httpResWrapper(res, error) })
  
  //
  // validateBody
  //
  function validateBody(data) {
    loggerApp.debug('validate body', data)
    
    return new Promise(function(resolve, reject) {
      // Schema description
      var bodySchema = joi.object({
        email: joi.string().email().required(),
        nickname: joi.string().required()
      })

      // Do validate
      joi.validate(data, bodySchema, function(err, value) {
        if(err) { reject({ status: '422', title: 'Invalid POST body' }) } 
        else { resolve() }
      })
    })
  }
  
}

export {createAccount, doPreReg}
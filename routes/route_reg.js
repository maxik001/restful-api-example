import joi from 'joi'
import redis from 'redis'

import hashGenerator from '../libs/hash_generator'
import httpResWrapper from '../libs/http_response_wrapper'
import loggerApp from '../libs/logger_app'

import modelAccountsLookupEmail from '../models/model_accounts_lookup_email'
import modelPersonLookupNickname from '../models/model_person_lookup_nickname'
import modelReg from '../models/model_reg'

import configReg from '../config/config_reg.json'
import configRedisReg from '../config/config_redis_reg.json'

import configRedis from '../config/config_redis.json'

function createAccount(req, res) {
  loggerApp.debug('route_reg.createAccount')
}

function doPreReg(req, res) {
  loggerApp.debug('route_reg.doPrereg')

  validateBody(req.body).then(function(data) {
    loggerApp.debug('data:', data)
    
    // Connect to redis
    const redisClient = new redis.createClient({
      host: configRedis.host,
      port: configRedis.port,
      db: configRedis.db,
      password: configRedis.password
    })

    redisClient.on('error', function (err) {
      loggerApp.error(err)
      res.status(503).end()
    })    
    
    const mAccountsLookupEmail = new modelAccountsLookupEmail(redisClient)
    const mPersonLookupNickname = new modelPersonLookupNickname(redisClient)

    Promise.all([
      mAccountsLookupEmail.isNotUsed(data.email),
      mPersonLookupNickname.isNotUsed(data.nickname)
    ]).then(function(my) {
      loggerApp.debug('Success validation')

      // TODO: Try to generate hash and send it to user 
      const hash = hashGenerator(configRecovery.hashLength)
      loggerApp.debug('new hash generated', hash)

      const redisClient = new redis.createClient({
        host: configRedisReg.host,
        port: configRedisReg.port,
        db: configRedisReg.db,
        password: configRedisReg.password
      })
  
      redisClient.on('error', function (err) {
        loggerApp.error(err)
        res.status(503).end()
      })      
      
      const mReg = new modelRecovery(redisClient)
      mReg.createKey(hash, req.body.email).then(function(keyName) {
        mReg.setKeyTimeout(keyName, configReg.keyTimeout)  
      })
      
      res.status(200).end()
      
      return {hash: hash, email: req.body.email}

      
    }).then(function(data) {
      
    }).catch(function(err) {
      loggerApp.debug('Fail validate args', err)
    })
    
    res.status(200).end()
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
        else { resolve({ email: data.email, nickname: data.nickname }) }
      })
    })
  }
  
}

export {createAccount, doPreReg}
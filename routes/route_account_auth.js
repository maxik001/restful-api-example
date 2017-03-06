import joi from 'joi'
import jwt from 'jsonwebtoken'
import redis from 'redis'

import modelAccount from '../models/model_account'
import modelAccountsLookupEmail from '../models/model_accounts_lookup_email'

import configJWT from '../config/config_jwt.json'
import configRedis from '../config/config_redis.json'

function doAuth (req, res) {
  /*
  const accountId = parseInt(req.params.id)

  if (!Number.isInteger(accountId)) {
    res.status(422).end()
    return
  }  
  */
  
  validateBody(req.body).then(function () {
    // Connect to redis
    const redisClient = new redis.createClient({
      host: configRedis.host,
      port: configRedis.port,
      db: configRedis.db,
      password: configRedis.password
    })

    redisClient.on('error', function (err) {
      console.log('Error! '+err)
      res.status(503).end()
      return
    })
    
    const mAccountsLookupEmail = new modelAccountsLookupEmail(redisClient)
    return mAccountsLookupEmail.get(req.body.email)
  }).then(function (accountId) {
    // Connect to redis
    const redisClient = new redis.createClient({
      host: configRedis.host,
      port: configRedis.port,
      db: configRedis.db,
      password: configRedis.password
    })

    redisClient.on('error', function (err) {
      console.log('Error! '+err)
      res.status(503).end()
      return
    })
    
    const mAccount = new modelAccount(redisClient)
    return mAccount.getById(accountId)
  }).then(function (oAccount) {
    // checkCredentials 
    const result = oAccount.checkCredentials(req.body.email, req.body.password)
    
    if(result) {
      //TODO: return JWT
      
      const payload = {id: oAccount.getId(), iat: Math.floor(Date.now() / configJWT.lifeTime)}
      const token = jwt.sign(payload, configJWT.secret)
      
      const bodyData = {success: true, id: oAccount.getId(), jwt: token}

      res.status(200).json(bodyData).end()
    } else {
      res.status(200).json({success:'false'}).end()
    }
  }).catch(function(error) {
    // Catch exceptions and errors
    // TODO: Remove console.log after tests
    console.log("catch error", error);
    switch(error.status) {
      case '404': {
        // Here we catch 404 error from redis models
        // email or id not found but user see it like invalid credentials
        res.status(200).json({success:'false'}).end()
        break;
      }
      case '422': {
        res.status(422).end();
        break;
      } 
      case '503': {
        res.status(503).end();
        break;
      }
      default: {
        res.status(500).end();
      }
    }
  })

  // validateBody 
  function validateBody(data) {
    return new Promise(function(resolve, reject) {
      // Validate input attributes
      var bodySchema = joi.object().keys({
        email: joi.string().email().required(),
        password: joi.string().required()
      }).with('email', 'password')

      joi.validate(data, bodySchema, function(err, value) {
        if(err) { reject({status:'422'}) } 
        else { resolve() }
      })
    })
  }

  
}

export {doAuth}
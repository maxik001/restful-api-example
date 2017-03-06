import emailjs from 'emailjs'
import fs from 'fs'
import hogan from 'hogan.js'
import joi from 'joi'
import redis from 'redis'

import hashGenerator from '../libs/hash_generator'
import passwdCrypt from '../libs/passwd_crypt'
import passwdGenerator from '../libs/passwd_generator'

import modelAccount from '../models/model_account'
import modelAccountsLookupEmail from '../models/model_accounts_lookup_email'
import modelRecovery from '../models/model_recovery'

import configAPI from '../config/config_api.json'
import configRecovery from '../config/config_recovery.json'
import configRedisRecovery from '../config/config_redis_recovery.json'

import configRedis from '../config/config_redis.json'

import SMTPConfig from '../config/config_smtp.json'

// Compile template
var emailTemplate= fs.readFileSync('./hjs/recovery_email.hjs', 'utf-8')
var compiledEmailTemplate = hogan.compile(emailTemplate)

/*
 * curl -i -X POST -H "Content-Type: application/json" -d '{"email":"test@test.ru"}' "http://127.0.0.1:8080/recovery"
 */
function generate(req, res) {
  console.log('recovery')
  
  validateBody(req.body).then(function () {
    // Write data in redis
    
    const redisClient = new redis.createClient({
      host: configRedisRecovery.host,
      port: configRedisRecovery.port,
      db: configRedisRecovery.db,
      password: configRedisRecovery.password
    })

    redisClient.on('error', function (err) {
      throw {
        status: '503',
        message: err
      }
    })

    const hash = hashGenerator(configRecovery.hashLength)
    
    const mRecovery = new modelRecovery(redisClient)
    mRecovery.createKey(hash, req.body.email).then(function(keyName) {
      mRecovery.setKeyTimeout(keyName, configRecovery.keyTimeout)  
    })
    
    res.status(200).end()
    
    return {hash: hash, email: req.body.email}
  }).then(function(data) {
    // Email to user 
    
    var server  = emailjs.server.connect({
      host: SMTPConfig.ip
    })
    
    const recoveryURL = configRecovery.recoveryURL+data.hash
    const sitename = "amhub.ru"
    
    var message = {
      text: "", 
      from: "noreply@amhub.ru", 
      to: data.email,
      subject: "Восстановление пароля",
      attachment: [
        { 
          data: compiledEmailTemplate.render({sitename: sitename, url: recoveryURL}),
          alternative: true 
        }
      ]
    }
    
    server.send(
      message, 
      function(err, message) { 
        if(err) {
          throw {
            status: '503',
            message: err
          } 
        } 
      }
    )
    
    res.status(200).end()
  }).catch(function(error) {
    if(error.message) console.log('error message:', error.message)
    
    // Catch exceptions and errors
    switch(error.status) {
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
  })

  // validateBody 
  function validateBody(data) {
    return new Promise(function(resolve, reject) {
      // Validate input attributes
      var bodySchema = joi.object({
        email: joi.string().email().required()
      })

      joi.validate(data, bodySchema, function(err, value) {
        if(err) { reject({ status:'422' }) } 
        else { resolve() }
      })
    })
  }
  
}

/*
 * curl -i -X GET -H "Content-Type: application/json" "http://127.0.0.1:8080/recovery/eef365cfda83fda23f724323df871b68"
 */
function validate(req, res) {
  console.log('validate')
  
  const hash = req.params.hash
  
  const redisClient = new redis.createClient({
    host: configRedisRecovery.host,
    port: configRedisRecovery.port,
    db: configRedisRecovery.db,
    password: configRedisRecovery.password
  })

  redisClient.on('error', function (err) {
    console.log('Error! '+err)
    throw '503'
  })
  
  const mRecovery = new modelRecovery(redisClient)
  
  mRecovery.hasHash(hash).then(function(email) {
    // Try to get account id by email
    if(!email) { throw '404' }

    // Connect to redis
    const redisClient = new redis.createClient({
      host: configRedis.host,
      port: configRedis.port,
      db: configRedis.db,
      password: configRedis.password
    })

    redisClient.on('error', function (err) {
      throw '503'
    })    
    
    const mAccountsLookupEmail = new modelAccountsLookupEmail(redisClient)

    return mAccountsLookupEmail.get(email)
  }).then(function(accountId) {
    res.status(200).end()
  }).catch(function(error) {
    // Catch exceptions and errors
    console.log('error:', error)
    
    switch(error.status) {
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
  })  
}

/*
 * curl -i -X GET -H "Content-Type: application/json" "http://127.0.0.1:8080/recovery/eef365cfda83fda23f724323df871b68"
 */
function resetPassword(req, res) {
  console.log('validate')
  
  const hash = req.params.hash
  
  const redisClient = new redis.createClient({
    host: configRedisRecovery.host,
    port: configRedisRecovery.port,
    db: configRedisRecovery.db,
    password: configRedisRecovery.password
  })

  redisClient.on('error', function (err) {
    console.log('Error! '+err)
    throw '503'
  })
  
  const mRecovery = new modelRecovery(redisClient)
  
  mRecovery.hasHash(hash).then(function(email) {
    // Try to get account id by email
    if(!email) { throw '404' }

    // Connect to redis
    const redisClient = new redis.createClient({
      host: configRedis.host,
      port: configRedis.port,
      db: configRedis.db,
      password: configRedis.password
    })

    redisClient.on('error', function (err) {
      throw '503'
    })    
    
    const mAccountsLookupEmail = new modelAccountsLookupEmail(redisClient)

    return mAccountsLookupEmail.get(email)
  }).then(function(accountId) {
    //
    // Get account from storage
    //
    
    // Connect to redis
    const redisClient = new redis.createClient({
      host: configRedis.host,
      port: configRedis.port,
      db: configRedis.db,
      password: configRedis.password
    })

    redisClient.on('error', function (err) {
      throw '503'
    })    
    
    const mAccount = new modelAccount(redisClient)
    
    return mAccount.getById(accountId)
  }).then(function(curAccount) {
    const newPasswd =  passwdGenerator(8)
    curAccount.setPasswordHash(passwdCrypt(newPasswd))
    
    // Connect to redis
    const redisClient = new redis.createClient({
      host: configRedis.host,
      port: configRedis.port,
      db: configRedis.db,
      password: configRedis.password
    })

    redisClient.on('error', function (err) {
      throw '503'
    })    
    
    const mAccount = new modelAccount(redisClient)    
    
    mAccount.update(curAccount)
    
    return newPasswd
  }).then(function(newPasswd) {
    // Email to user 
    
    var server  = emailjs.server.connect({
      host: SMTPConfig.ip
    })
    
    const sitename = "amhub.ru"
    
    var message = {
      text: "", 
      from: "noreply@amhub.ru", 
      to: data.email,
      subject: "Новый пароль",
      attachment: [
        { 
          data: compiledEmailTemplate.render({sitename: sitename, password: newPasswd}),
          alternative: true 
        }
      ]
    }
    
    server.send(
      message, 
      function(err, message) { 
        if(err) {
          throw {
            status: '503',
            message: err
          } 
        } 
      }
    )    
    
    res.status(200).end()
  }).catch(function(error) {
    // Catch exceptions and errors
    console.log('error:', error)
    
    switch(error.status) {
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
  })  
}


export {generate, resetPassword, validate}
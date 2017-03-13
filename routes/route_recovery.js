import emailjs from 'emailjs'
import fs from 'fs'
import hogan from 'hogan.js'
import joi from 'joi'
import redis from 'redis'

import hashGenerator from '../libs/hash_generator'
import httpResWrapper from '../libs/http_response_wrapper'
import loggerApp from '../libs/logger_app'
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

var emailTemplateNewPasswd= fs.readFileSync('./hjs/recovery_new_passwd.hjs', 'utf-8')
var compiledEmailTemplateNewPasswd = hogan.compile(emailTemplateNewPasswd)


/*
 * curl -i -X POST -H "Content-Type: application/json" -d '{"email":"test@test.ru"}' "http://127.0.0.1:8080/recovery"
 */
function generate(req, res) {
  loggerApp.debug('route_recovery.generate')
  
  validateBody(req.body).then(function () {
    // Write data in redis
    
    const redisClient = new redis.createClient({
      host: configRedisRecovery.host,
      port: configRedisRecovery.port,
      db: configRedisRecovery.db,
      password: configRedisRecovery.password
    })

    redisClient.on('error', function (err) {
      loggerApp.error(err)
      res.status(503).end()
    })

    const hash = hashGenerator(configRecovery.hashLength)
  
    loggerApp.debug('new hash generated', hash)
    
    const mRecovery = new modelRecovery(redisClient)
    mRecovery.createKey(hash, req.body.email).then(function(keyName) {
      mRecovery.setKeyTimeout(keyName, configRecovery.keyTimeout)  
    })
    
    res.status(200).end()
    
    return {hash: hash, email: req.body.email}
  }).then(function(data) {
    // SMTP server config 
    var server  = emailjs.server.connect({
      host: SMTPConfig.ip
    })
    
    // Email description
    const recoveryURL = configRecovery.recoveryURL+data.hash
    const sitename = configAPI.siteDomain
    
    var message = {
      text: "", 
      from: "noreply@"+configAPI.siteDomain, 
      to: data.email,
      subject: "Восстановление пароля",
      attachment: [
        { 
          data: compiledEmailTemplate.render({sitename: sitename, url: recoveryURL}),
          alternative: true 
        }
      ]
    }
    
    // Send email
    loggerApp.debug('send email')
    
    server.send(
      message, 
      function(err, message) { 
        if(err) {
          loggerApp.error(err)
          res.status(503).end()
        } 
      }
    )
    
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
        email: joi.string().email().required()
      })

      // Do validate
      joi.validate(data, bodySchema, function(err, value) {
        if(err) { reject({ status: '422' }) } 
        else { resolve() }
      })
    })
  }
  
}

/*
 * curl -i -X GET -H "Content-Type: application/json" "http://127.0.0.1:8080/recovery/eef365cfda83fda23f724323df871b68"
 */
function resetPassword(req, res) {
  loggerApp.debug('route_recovery.resetPassword')
  
  loggerApp.debug('get hash', hash)
  const hash = req.params.hash
  
  const redisClient = new redis.createClient({
    host: configRedisRecovery.host,
    port: configRedisRecovery.port,
    db: configRedisRecovery.db,
    password: configRedisRecovery.password
  })

  redisClient.on('error', function (err) {
    loggerApp.error(err)
    res.status(503).end()
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
      loggerApp.error(err)
      res.status(503).end()
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
      loggerApp.error(err)
      res.status(503).end()
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
      loggerApp.error(err)
      res.status(503).end()
    })    
    
    const mAccount = new modelAccount(redisClient)    
    
    mAccount.update(curAccount)
    
    return {curAccount, newPasswd}
  }).then(function(data) {
    // SMTP server config
    var server  = emailjs.server.connect({
      host: SMTPConfig.ip
    })
    
    // Email description
    const sitename = configAPI.siteDomain
    
    var message = {
      text: "", 
      from: "noreply@" + configAPI.siteDomain, 
      to: data.curAccount.getEmail(),
      subject: "Новый пароль",
      attachment: [
        { 
          data: compiledEmailTemplateNewPasswd.render({sitename: sitename, password: data.newPasswd}),
          alternative: true 
        }
      ]
    }
    
    // Send email
    server.send(
      message, 
      function(err, message) { 
        if(err) {
          loggerApp.error(err)
          res.status(503).end()
        } 
      }
    )    
    
    res.status(200).end()
  }).catch(function(error) { httpResWrapper(res, error) })  
}


export {generate, resetPassword}
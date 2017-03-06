import joi from 'joi'
import jwt from 'jsonwebtoken'
import redis from 'redis'

import configJWT from '../config/config_jwt.json'
import configRedis from '../config/config_redis.json'

// tokenData
// Here is payload

// tokenStatus
// 0 - was not specified
// 1 - correct
// 2 - incorrect

export default function tokenDecode (req, res, next) {
  var token = req.body.token || req.query.token || req.headers['x-access-token'];
  
  if (token) {
    jwt.verify(token, configJWT.secret, function (err, decoded) {
      if (err) {
        req.tokenStatus = 2
        next()
      } else {
        req.tokenStatus = 1
        req.tokenData = decoded
        next()
      }
    })
  } else {
    req.tokenStatus = 0
    next()
  }
}

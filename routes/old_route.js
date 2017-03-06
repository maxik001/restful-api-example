import joi from 'joi'
import jwt from 'jsonwebtoken'
import redis from 'redis'

import modelAds from '../models/model_ads'
import modelManufacturer from '../models/model_manufacturers'
import modelModel from '../models/model_models'
import modelSeller from '../models/model_seller'
import modelTransmissions from '../models/model_transmissions'

import configRedis from '../config/config_redis.json'

function create (req, res) {
}

function get (req, res) {
  const ads_id = parseInt(req.params.id)

  if (!Number.isInteger(ads_id)) {
    res.status(422).end()
    return
  }
  
  const redisClient = new redis.createClient({
    host: configRedis.host,
    port: configRedis.port,
    db: configRedis.db,
    password: configRedis.password
  })

  var m_ads = new modelAds(redisClient)

  m_ads.create('test', redisClient).then(function(val) {
    console.log('val: ', val)
  }).catch(function(err) {
    console.log('err: ', err)
  })
  
/*  
  m_ads.getById(ads_id).then(function(val) {
    console.log('val: ', val)
  }).catch(function(err) {
    console.log('err: ', err)
  })
*/
  
  /*  
  var m = new modelSeller(redisClient)
  
  m.set({id:'1', name: 'maxik001'}).then(function(val) {
    console.log('val: ', val)
  }).catch(function(err) {
    console.log('err: ', err)
  })
  
  var m = new modelManufacturer(redisClient)
  var mo = new modelModel(redisClient)
  
  m.getById(req.params.id).then(function(val) {
    console.log('val: ', val)
  }).catch(function(err) {
    console.log('err: ', err)
  })
  
  m.getAll().then(function(val) {
    console.log('val: ', val)
  }).catch(function(err) {
    console.log('err: ', err)
  })

  mo.getById(req.params.id, 2).then(function(val) {
    console.log('val: ', val)
  }).catch(function(err) {
    console.log('err: ', err)
  })
  
  mo.getAll(1).then(function(val) {
    console.log('val: ', val)
  }).catch(function(err) {
    console.log('err: ', err)
  })
*/

  res.status(200).end()
}

export {create, get}

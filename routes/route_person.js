import redis from 'redis'

import modelPerson from '../models/model_person'

import configRedis from '../config/config_redis.json'

function getPerson (req, res) {
  const personId = parseInt(req.params.id)

  if (!Number.isInteger(personId)) {
    res.status(422).end()
    return
  }  

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
  
  var m = new modelPerson(redisClient)

  m.getById(personId).then(function (person) {
    res.status(200).json(person.getAllAttr()).end()
  }).catch(function (err) {
    res.status(404).end()
  })
}

export {getPerson}
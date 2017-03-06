export default class modelRecovery {
  constructor(redisClient) {
    this.keyName = 'recovery'
    this.redisClient = redisClient
  }
  
  createKey(hash, email) {
    var redisClient = this.redisClient
    var keyName = this.keyName+':'+hash
    var keyValue = email
    
    return new Promise (function (resolve, reject) {
      redisClient.set(
        keyName,
        keyValue,
        function (err, reply) {
          if (err || !reply) { reject(err) }
          else { resolve(keyName) }
        }
      )
    }) 
  }

  hasHash(hash) {
    var redisClient = this.redisClient
    var keyName = this.keyName+':'+hash
    
    return new Promise (function (resolve, reject) {
      redisClient.get(
        keyName,
        function (err, reply) {
          if (err) { reject(err) }
          else if(!reply) { reject({status: '404'}) }
          else {
            resolve(reply)
          }
        }
      )
    })     
  }
  
  setKeyTimeout(keyName, timeout) {
    var redisClient = this.redisClient
    
    return new Promise (function (resolve, reject) {
      redisClient.expire(
        keyName,
        timeout,
        function (err, reply) {
          if (err || !reply) { reject(err) }
          else { resolve() }
        }
      )
    }) 
  }
  
  
}
export default class modelAccountsLookupEmail {
  constructor(redisClient) {
    this.keyName = 'accounts:lookup:email'    
    this.redisClient = redisClient
  }

  get (email) {
    var redisClient = this.redisClient
    var keyName = this.keyName

    return new Promise (function (resolve, reject) {
      redisClient.hget(
        keyName,
        email,
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
  
  isNotUsed (email) {
    var redisClient = this.redisClient
    var keyName = this.keyName

    return new Promise (function (resolve, reject) {
      redisClient.hget(
        keyName,
        email,
        function (err, reply) {
          if (err) { reject(err) }
          else if(!reply) { resolve() }
          else { reject({ status: '302' }) }
        }
      )
    }) 
  }
  
}

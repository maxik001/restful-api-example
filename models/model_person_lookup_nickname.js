export default class modelPersonLookupNickname {
  constructor(redisClient) {
    this.keyName = 'persons:lookup:nickname'    
    this.redisClient = redisClient
  }

  get (nickname) {
    var redisClient = this.redisClient
    var keyName = this.keyName

    return new Promise (function (resolve, reject) {
      redisClient.hget(
        keyName,
        nickname,
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
}

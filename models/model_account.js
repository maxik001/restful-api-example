import objAccount from '../classes/class_obj_account'

export default class modelAccount {
  constructor(redisClient) {
    this.keyName = 'account'    
    this.redisClient = redisClient
  }

  getById (id) {
    var redisClient = this.redisClient
    var keyName = this.keyName+':'+id

    return new Promise (function (resolve, reject) {
      redisClient.hgetall(
        keyName,
        function (err, reply) {
          if (err) { reject(err) }
          else if(!reply) { reject({status: '404'}) }
          else {
            // TODO: We must check data from redis or not?
            var account = new objAccount(id, reply.email, reply.password, reply.status)
            resolve(account)
          }
        }
      )
    }) 
  }
  
  update (objAccount) {
    var redisClient = this.redisClient
    var keyName = this.keyName+':'+objAccount.getId()

    return new Promise (function (resolve, reject) {
      redisClient.hmset(
        keyName,
        {email: objAccount.getEmail(), password: objAccount.getPasswordHash(), status: objAccount.getStatus()},
        function (err, reply) {
          if (err) { reject(err) }
          else if(!reply) { reject({status: '404'}) }
          else {
            resolve()
          }
        }
      )
    }) 
  }
}

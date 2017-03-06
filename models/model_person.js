import objPerson from '../classes/class_obj_person' 

export default class modelPersons {
  constructor(redisClient) {
    this.keyName = 'person'
    this.redisClient = redisClient
  }
  
  getById (id) {
    var redisClient = this.redisClient
    var keyName = this.keyName+':'+id

    return new Promise (function (resolve, reject) {
      redisClient.hgetall(
        keyName,
        function (err, reply) {
          if (err || !reply) { reject(err) }
          else {
            // TODO: We must check data from redis or not?
            var person = new objPerson(reply.id, reply.accountId, reply.nickname)
            resolve(person)
          }
        }
      )
    }) 
  }  
}

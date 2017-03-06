export default class modelSequence {
  constructor(keyName, redisClient) {
    this.keyName = keyName
    this.redisClient = redisClient
  }

  getNext () {
    var redisClient = this.redisClient
    var keyName = this.keyName

    return new Promise(function (resolve, reject) {
      redisClient.incr(
        keyName,
        function (err, reply) {
          if (err) { reject(err) }
          resolve(reply)
        }
      )
    })
  }
}

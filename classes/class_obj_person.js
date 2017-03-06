export default class objPerson {
  constructor(id, accountId, nickname) {
    this.id = id
    this.accountId = accountId
    this.nickname = nickname
  }
  
  getId () { return this.id }
  getAccountId () { return this.accountId }
  getNickname () { return this.nickname }
  
  getAllAttr () { 
    return {
      id: this.id,
      accountId: this.accountId,
      nickname: this.nickname
    }
  }
  
  setNickname (nickname) { this.nickname = nickname }
}

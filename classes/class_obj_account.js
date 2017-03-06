export default class objAccount {
  constructor(id, email, passwordHash, status) {
    this.id = id
    this.email = email
    this.passwordHash = passwordHash
    this.status = status
  }
  
  checkCredentials (email, passwordHash) {
    if(email === this.email && passwordHash === this.passwordHash) {
      return true
    } else {
      return false
    }
  }
  
  getId () { return this.id }
  getEmail () { return this.email }
  getPasswordHash () { return this.passwordHash }
  getStatus () { return this.status }
  
  getAllAttr () { 
    return {
      id: this.id,
      email: this.email,
      passwordHash: this.passwordHash,
      status: this.status
    } 
  }
  
  setEmail (email) { this.email = email }
  setPasswordHash (passwordHash) { this.passwordHash = passwordHash }
  setStatus (status) { this.status = status } 
}

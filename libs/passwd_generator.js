export default function(length) {
  const alphabet = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
    
  var rndString = ""
    
  for(var i = 0;i < length;i++) {
    var rndPos = Math.floor(Math.random()*alphabet.length)
    rndString += alphabet.substring(rndPos, rndPos+1)
  }
  
  return rndString
} 
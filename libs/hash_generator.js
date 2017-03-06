import crypto from 'crypto'

export default function(length) {
  return crypto.randomBytes(length).toString('hex')
}
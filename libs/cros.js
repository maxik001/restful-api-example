export default function cros (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, x-access-token, X-Requested-With, Content-Type, Accept')
  next()
}

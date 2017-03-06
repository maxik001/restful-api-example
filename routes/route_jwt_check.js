function doCheck (req, res) {
  if(req.tokenStatus == 1) {
    res.status(200).end()
  } else {
    res.status(401).end()
  }
}

export {doCheck}
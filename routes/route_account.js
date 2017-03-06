function getAccount (req, res) {
  const accountId = parseInt(req.params.id)

  if (!Number.isInteger(accountId)) {
    res.status(422).end()
    return
  }  
  
  res.status(200).end()
}

export {getAccount}
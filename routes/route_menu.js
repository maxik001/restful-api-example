function getTopMenu (req, res) {

  console.log(req.tokenStatus)
  console.log(req.tokenData)
  
  var menu = {}
  
  if(req.tokenStatus == 1) {
    menu = {
      item: {text: 'Выход', href: '/logout'}
    }
  } else {
    menu = {
      item: {text: 'Вход', href: '/login'}
    }
  }
  
  res.status(200).json(menu).end()
}

export {getTopMenu}
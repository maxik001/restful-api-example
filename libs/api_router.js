import express from 'express'

import * as apiInfo from '../routes/api_info'
import * as routeAccount from '../routes/route_account'
import * as routeAccountAuth from '../routes/route_account_auth'
import * as routeJWTCheck from '../routes/route_jwt_check'
import * as routePerson from '../routes/route_person'
import * as routeMenu from '../routes/route_menu'
import * as routeRecovery from '../routes/route_recovery'

const router = express.Router()

// API Info
router.get('/api/version', apiInfo.getVersion)

// Account
router.get('/account/:id', routeAccount.getAccount)

// Account auth
router.post('/account/auth/', routeAccountAuth.doAuth)

// Check JWT
router.get('/jwt/check', routeJWTCheck.doCheck)

// Menu
router.get('/menu/top', routeMenu.getTopMenu)

// Person
router.get('/person/:id', routePerson.getPerson)

// Recovery
router.get('/recovery/:hash', routeRecovery.resetPassword)
router.post('/recovery', routeRecovery.generate)

export default router

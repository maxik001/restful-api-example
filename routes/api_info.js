import configApi from '../config/config_api.json'

function getVersion (req, res) {
  res.status(200).json({version: configApi.version}).end()
}

export {getVersion}

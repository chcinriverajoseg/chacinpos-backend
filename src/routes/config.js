const express = require('express')
const router = express.Router()
const { getConfiguracion, actualizarConfiguracion } = require('../controllers/configController')
const { verificarToken, verificarRol } = require('../middlewares/auth')

router.get('/', verificarToken, getConfiguracion)
router.put('/', verificarToken, verificarRol('administrador'), actualizarConfiguracion)

module.exports = router
const express = require('express')
const router = express.Router()
const { login, registrar, perfil } = require('../controllers/authController')
const { verificarToken, verificarRol } = require('../middlewares/auth')

router.post('/login', login)
router.post('/registrar', verificarToken, verificarRol('administrador'), registrar)
router.get('/perfil', verificarToken, perfil)

module.exports = router
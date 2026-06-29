const express = require('express')
const router = express.Router()
const { crearVenta, getVentas, getVenta, getReporte } = require('../controllers/ventasController')
const { verificarToken, verificarRol } = require('../middlewares/auth')

router.get('/', verificarToken, getVentas)
router.get('/reporte', verificarToken, getReporte)
router.get('/:id', verificarToken, getVenta)
router.post('/', verificarToken, verificarRol('administrador', 'cajero'), crearVenta)

module.exports = router
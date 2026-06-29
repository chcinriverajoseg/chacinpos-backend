const express = require('express')
const router = express.Router()
const { getProductos, getProducto, crearProducto, actualizarProducto, eliminarProducto, buscarProducto } = require('../controllers/productosController')
const { verificarToken, verificarRol } = require('../middlewares/auth')

router.get('/', verificarToken, getProductos)
router.get('/buscar', verificarToken, buscarProducto)
router.get('/:id', verificarToken, getProducto)
router.post('/', verificarToken, verificarRol('administrador', 'bodega'), crearProducto)
router.put('/:id', verificarToken, verificarRol('administrador', 'bodega'), actualizarProducto)
router.delete('/:id', verificarToken, verificarRol('administrador'), eliminarProducto)

module.exports = router
const express = require('express')
const router = express.Router()
const pool = require('../config/db')
const { verificarToken } = require('../middlewares/auth')

router.get('/', verificarToken, async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM proveedores WHERE activo = true ORDER BY nombre')
    res.json({ proveedores: resultado.rows })
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

router.post('/', verificarToken, async (req, res) => {
  const { nombre, rut, email, telefono, direccion, contacto } = req.body
  try {
    const resultado = await pool.query(
      'INSERT INTO proveedores (nombre, rut, email, telefono, direccion, contacto) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [nombre, rut, email, telefono, direccion, contacto]
    )
    res.status(201).json({ proveedor: resultado.rows[0] })
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

router.put('/:id', verificarToken, async (req, res) => {
  const { id } = req.params
  const { nombre, rut, email, telefono, direccion, contacto } = req.body
  try {
    const resultado = await pool.query(
      'UPDATE proveedores SET nombre=$1, rut=$2, email=$3, telefono=$4, direccion=$5, contacto=$6 WHERE id=$7 RETURNING *',
      [nombre, rut, email, telefono, direccion, contacto, id]
    )
    res.json({ proveedor: resultado.rows[0] })
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

router.delete('/:id', verificarToken, async (req, res) => {
  const { id } = req.params
  try {
    await pool.query('UPDATE proveedores SET activo = false WHERE id = $1', [id])
    res.json({ mensaje: 'Proveedor eliminado' })
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

module.exports = router
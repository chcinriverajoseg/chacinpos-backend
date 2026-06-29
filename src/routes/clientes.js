const express = require('express')
const router = express.Router()
const pool = require('../config/db')
const { verificarToken } = require('../middlewares/auth')

router.get('/', verificarToken, async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM clientes WHERE activo = true ORDER BY nombre')
    res.json({ clientes: resultado.rows })
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})
router.post('/', verificarToken, async (req, res) => {
  const { nombre, rut, email, telefono, direccion, giro } = req.body
  console.log('Datos recibidos:', req.body)
  try {
    const resultado = await pool.query(
      'INSERT INTO clientes (nombre, rut, email, telefono, direccion, giro) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [nombre, rut, email, telefono, direccion, giro]
    )
    res.status(201).json({ cliente: resultado.rows[0] })
  } catch (err) {
    console.error('Error en clientes POST:', err.message)
    res.status(500).json({ error: err.message })
  }
})

router.put('/:id', verificarToken, async (req, res) => {
  const { id } = req.params
  const { nombre, rut, email, telefono, direccion, giro } = req.body
  try {
    const resultado = await pool.query(
      'UPDATE clientes SET nombre=$1, rut=$2, email=$3, telefono=$4, direccion=$5, giro=$6 WHERE id=$7 RETURNING *',
      [nombre, rut, email, telefono, direccion, giro, id]
    )
    res.json({ cliente: resultado.rows[0] })
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

router.delete('/:id', verificarToken, async (req, res) => {
  const { id } = req.params
  try {
    await pool.query('UPDATE clientes SET activo = false WHERE id = $1', [id])
    res.json({ mensaje: 'Cliente eliminado' })
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

module.exports = router
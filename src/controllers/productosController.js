const pool = require('../config/db')

const getProductos = async (req, res) => {
  try {
    const resultado = await pool.query(
      'SELECT * FROM productos ORDER BY categoria, nombre'
    )
    res.json({ productos: resultado.rows })
  } catch (err) {
    console.error('Error al obtener productos:', err.message)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

const getProducto = async (req, res) => {
  try {
    const { id } = req.params
    const resultado = await pool.query(
      'SELECT * FROM productos WHERE id = $1', [id]
    )
    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' })
    }
    res.json({ producto: resultado.rows[0] })
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

const crearProducto = async (req, res) => {
  const { nombre, codigo, categoria, tipo, precio, costo, stock, stock_min, emoji } = req.body
  try {
    const resultado = await pool.query(
      `INSERT INTO productos (nombre, codigo, categoria, tipo, precio, costo, stock, stock_min, emoji)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [nombre, codigo, categoria, tipo, precio, costo || 0, stock || 0, stock_min || 5, emoji || '📦']
    )
    res.status(201).json({ producto: resultado.rows[0] })
  } catch (err) {
    console.error('Error al crear producto:', err.message)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

const actualizarProducto = async (req, res) => {
  const { id } = req.params
  const { nombre, codigo, categoria, tipo, precio, costo, stock, stock_min, emoji, activo } = req.body
  try {
    const resultado = await pool.query(
      `UPDATE productos SET
        nombre = $1, codigo = $2, categoria = $3, tipo = $4,
        precio = $5, costo = $6, stock = $7, stock_min = $8,
        emoji = $9, activo = $10
       WHERE id = $11 RETURNING *`,
      [nombre, codigo, categoria, tipo, precio, costo, stock, stock_min, emoji, activo, id]
    )
    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' })
    }
    res.json({ producto: resultado.rows[0] })
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

const eliminarProducto = async (req, res) => {
  const { id } = req.params
  try {
    await pool.query('UPDATE productos SET activo = false WHERE id = $1', [id])
    res.json({ mensaje: 'Producto eliminado correctamente' })
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

const buscarProducto = async (req, res) => {
  const { q } = req.query
  try {
    const resultado = await pool.query(
      `SELECT * FROM productos WHERE activo = true AND
        (LOWER(nombre) LIKE LOWER($1) OR codigo LIKE $1)
       ORDER BY nombre`,
      [`%${q}%`]
    )
    res.json({ productos: resultado.rows })
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

module.exports = { getProductos, getProducto, crearProducto, actualizarProducto, eliminarProducto, buscarProducto }
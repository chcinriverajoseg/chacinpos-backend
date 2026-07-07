const pool = require('../config/db')

const getConfiguracion = async (req, res) => {
  try {
    const resultado = await pool.query(
      'SELECT * FROM configuracion ORDER BY id LIMIT 1'
    )
    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: 'Configuración no encontrada' })
    }
    res.json({ configuracion: resultado.rows[0] })
  } catch (err) {
    console.error('Error al obtener configuración:', err.message)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

const actualizarConfiguracion = async (req, res) => {
  const { nombre_negocio, rut, direccion, telefono, moneda, iva, mensaje_boleta } = req.body
  try {
    const existente = await pool.query('SELECT id FROM configuracion ORDER BY id LIMIT 1')

    let resultado
    if (existente.rows.length === 0) {
      resultado = await pool.query(
        `INSERT INTO configuracion (nombre_negocio, rut, direccion, telefono, moneda, iva, mensaje_boleta)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [nombre_negocio, rut, direccion, telefono, moneda || 'CLP', iva || 19, mensaje_boleta]
      )
    } else {
      resultado = await pool.query(
        `UPDATE configuracion SET
          nombre_negocio = $1, rut = $2, direccion = $3, telefono = $4,
          moneda = $5, iva = $6, mensaje_boleta = $7, actualizado_en = NOW()
         WHERE id = $8 RETURNING *`,
        [nombre_negocio, rut, direccion, telefono, moneda || 'CLP', iva || 19, mensaje_boleta, existente.rows[0].id]
      )
    }
    res.json({ configuracion: resultado.rows[0] })
  } catch (err) {
    console.error('Error al actualizar configuración:', err.message)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

module.exports = { getConfiguracion, actualizarConfiguracion }
const pool = require('../config/db')

const crearVenta = async (req, res) => {
  const { tipo, items, total, neto, iva, recibido, vuelto, cliente, billetes_recibidos, billetes_vuelto } = req.body
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    // Obtener último folio
    const folioRes = await client.query('SELECT COALESCE(MAX(folio), 1000) + 1 AS folio FROM ventas')
    const folio = folioRes.rows[0].folio

    // Crear venta
    const ventaRes = await client.query(
      `INSERT INTO ventas (folio, tipo, total, neto, iva, recibido, vuelto, cliente_nombre, cliente_rut, cliente_giro, usuario_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [folio, tipo, total, neto, iva, recibido, vuelto,
       cliente?.nombre, cliente?.rut, cliente?.giro, req.usuario?.id]
    )
    const venta = ventaRes.rows[0]

    // Insertar items y descontar stock
    for (const item of items) {
      await client.query(
        `INSERT INTO venta_items (venta_id, producto_id, nombre, cantidad, precio, total)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [venta.id, item.id, item.nombre, item.cantidad, item.precio, item.precio * item.cantidad]
      )
      await client.query(
        'UPDATE productos SET stock = stock - $1 WHERE id = $2',
        [item.tipo === 'unidad' ? item.cantidad : 1, item.id]
      )
    }

    // Registrar billetes recibidos
    if (billetes_recibidos?.length > 0) {
      for (const b of billetes_recibidos) {
        await client.query(
          `INSERT INTO caja_movimientos (tipo, denominacion, cantidad, venta_id, usuario_id)
           VALUES ('entrada', $1, $2, $3, $4)`,
          [b.denominacion, b.cantidad, venta.id, req.usuario?.id]
        )
      }
    }

    // Registrar billetes vuelto
    if (billetes_vuelto?.length > 0) {
      for (const b of billetes_vuelto) {
        await client.query(
          `INSERT INTO caja_movimientos (tipo, denominacion, cantidad, venta_id, usuario_id)
           VALUES ('salida', $1, $2, $3, $4)`,
          [b.denominacion, b.cantidad, venta.id, req.usuario?.id]
        )
      }
    }

    // Log auditoría
    await client.query(
      `INSERT INTO auditoria_log (accion, tabla, registro_id, datos_nuevos, usuario_id)
       VALUES ('CREAR_VENTA', 'ventas', $1, $2, $3)`,
      [venta.id, JSON.stringify(venta), req.usuario?.id]
    )

    await client.query('COMMIT')
    res.status(201).json({ venta, folio })

  } catch (err) {
    await client.query('ROLLBACK')
    console.error('Error al crear venta:', err.message)
    res.status(500).json({ error: 'Error al procesar la venta' })
  } finally {
    client.release()
  }
}

const getVentas = async (req, res) => {
  try {
    const { fecha } = req.query
    let query = `
      SELECT v.*, u.nombre as cajero
      FROM ventas v
      LEFT JOIN usuarios u ON v.usuario_id = u.id
      ORDER BY v.created_at DESC
      LIMIT 100
    `
    const resultado = await pool.query(query)
    res.json({ ventas: resultado.rows })
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

const getVenta = async (req, res) => {
  try {
    const { id } = req.params
    const venta = await pool.query('SELECT * FROM ventas WHERE id = $1', [id])
    const items = await pool.query('SELECT * FROM venta_items WHERE venta_id = $1', [id])
    if (venta.rows.length === 0) {
      return res.status(404).json({ error: 'Venta no encontrada' })
    }
    res.json({ venta: venta.rows[0], items: items.rows })
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

const getReporte = async (req, res) => {
  try {
    const hoy = new Date().toISOString().split('T')[0]
    const totalDia = await pool.query(
      `SELECT COUNT(*) as transacciones, SUM(total) as total, SUM(neto) as neto, SUM(iva) as iva
       FROM ventas WHERE DATE(created_at) = $1`, [hoy]
    )
    const topProductos = await pool.query(
      `SELECT vi.nombre, SUM(vi.cantidad) as vendido, SUM(vi.total) as total
       FROM venta_items vi
       JOIN ventas v ON vi.venta_id = v.id
       WHERE DATE(v.created_at) = $1
       GROUP BY vi.nombre ORDER BY vendido DESC LIMIT 5`, [hoy]
    )
    res.json({
      resumen: totalDia.rows[0],
      top_productos: topProductos.rows
    })
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

module.exports = { crearVenta, getVentas, getVenta, getReporte }
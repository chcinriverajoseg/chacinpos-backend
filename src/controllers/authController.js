require('dotenv').config()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const pool = require('../config/db')

const login = async (req, res) => {
  const { email, password } = req.body

  try {
    const resultado = await pool.query(
      'SELECT * FROM usuarios WHERE email = $1 AND activo = true',
      [email]
    )

    if (resultado.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales incorrectas' })
    }

    const usuario = resultado.rows[0]

    const passwordValido = await bcrypt.compare(password, usuario.password)
    if (!passwordValido) {
      return res.status(401).json({ error: 'Credenciales incorrectas' })
    }

    const token = jwt.sign(
      { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES }
    )

    res.json({
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
      }
    })

  } catch (err) {
    console.error('Error en login:', err.message)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

const registrar = async (req, res) => {
  const { nombre, email, password, rol } = req.body

  try {
    const existe = await pool.query('SELECT id FROM usuarios WHERE email = $1', [email])
    if (existe.rows.length > 0) {
      return res.status(400).json({ error: 'El email ya está registrado' })
    }

    const hash = await bcrypt.hash(password, 10)

    const resultado = await pool.query(
      'INSERT INTO usuarios (nombre, email, password, rol) VALUES ($1, $2, $3, $4) RETURNING id, nombre, email, rol',
      [nombre, email, hash, rol || 'cajero']
    )

    res.status(201).json({ usuario: resultado.rows[0] })

  } catch (err) {
    console.error('Error en registro:', err.message)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

const perfil = async (req, res) => {
  try {
    const resultado = await pool.query(
      'SELECT id, nombre, email, rol, created_at FROM usuarios WHERE id = $1',
      [req.usuario.id]
    )
    res.json({ usuario: resultado.rows[0] })
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

module.exports = { login, registrar, perfil }
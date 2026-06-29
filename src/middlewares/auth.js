const jwt = require('jsonwebtoken')
require('dotenv').config()

const verificarToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  
  console.log('JWT_SECRET:', process.env.JWT_SECRET) // debug
  console.log('Token recibido:', token ? 'sí' : 'no')

  if (!token) {
    return res.status(401).json({ error: 'Token requerido' })
  }
  console.log('Token recibido:', token)

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.usuario = decoded
    next()
  } catch (err) {
    console.log('Error JWT:', err.message)
    console.log('Secret usado:', process.env.JWT_SECRET)
    return res.status(403).json({ error: 'Token inválido o expirado' })
  }
}

const verificarRol = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.usuario.rol)) {
      return res.status(403).json({ error: 'No tienes permisos para esta acción' })
    }
    next()
  }
}

module.exports = { verificarToken, verificarRol }
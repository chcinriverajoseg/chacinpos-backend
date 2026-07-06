const jwt = require('jsonwebtoken')
require('dotenv').config()

const verificarToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'Token requerido' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.usuario = decoded
    next()
  } catch (err) {
    console.log('Error JWT:', err.message)
    return res.status(401).json({ error: 'Token inválido o expirado' }) // 401, no 403
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
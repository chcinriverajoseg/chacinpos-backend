require('dotenv').config()
const express = require('express')
const cors = require('cors')

const authRoutes        = require('./routes/auth')
const productosRoutes   = require('./routes/productos')
const ventasRoutes      = require('./routes/ventas')
const clientesRoutes    = require('./routes/clientes')
const proveedoresRoutes = require('./routes/proveedores')
const configRoutes      = require('./routes/config')

const app = express()

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'https://chacinpos-frontend.vercel.app',
    'https://chacinpos-frontend-git-main-jose-gregorios-projects.vercel.app'
  ],
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api/auth',        authRoutes)
app.use('/api/productos',   productosRoutes)
app.use('/api/ventas',      ventasRoutes)
app.use('/api/clientes',    clientesRoutes)
app.use('/api/proveedores', proveedoresRoutes)
app.use('/api/config',      configRoutes)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', mensaje: 'ChacinPOS API funcionando ✅' })
})

app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' })
})

app.use((err, req, res, next) => {
  console.error('Error global:', err.message)
  res.status(500).json({ error: 'Error interno del servidor' })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`🚀 ChacinPOS API corriendo en http://localhost:${PORT}`)
})

module.exports = app
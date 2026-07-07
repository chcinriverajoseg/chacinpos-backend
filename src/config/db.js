const { Pool } = require('pg')
require('dotenv').config()

const pool = new Pool({
  host:     process.env.DB_HOST || 'localhost',
  port:     parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'chacinpos',
  user:     process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  ssl: process.env.DB_HOST && process.env.DB_HOST !== 'localhost'
    ? { rejectUnauthorized: false }
    : false,
})

pool.on('connect', () => {
  console.log('✅ Conectado a PostgreSQL - ChacinPOS')
})

pool.on('error', (err) => {
  console.error('❌ Error en PostgreSQL:', err.message)
})

module.exports = pool
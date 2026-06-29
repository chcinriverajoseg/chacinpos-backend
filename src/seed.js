const bcrypt = require('bcryptjs')
const pool = require('./config/db')

async function seed() {
  try {
    const hash1 = await bcrypt.hash('admin123', 10)
    const hash2 = await bcrypt.hash('cajero123', 10)
    const hash3 = await bcrypt.hash('bodega123', 10)

    await pool.query('UPDATE usuarios SET password = $1 WHERE email = $2', [hash1, 'admin@chacinpos.cl'])
    await pool.query('UPDATE usuarios SET password = $1 WHERE email = $2', [hash2, 'cajera@chacinpos.cl'])
    await pool.query('UPDATE usuarios SET password = $1 WHERE email = $2', [hash3, 'bodega@chacinpos.cl'])

    console.log('✅ Contraseñas actualizadas correctamente')
    process.exit(0)
  } catch (err) {
    console.error('❌ Error:', err.message)
    process.exit(1)
  }
}

seed()
const bcrypt = require('bcryptjs')
const pool = require('./config/db')

async function seed() {
  try {
    const hash1 = await bcrypt.hash('admin123', 10)
    const hash2 = await bcrypt.hash('cajero123', 10)
    const hash3 = await bcrypt.hash('bodega123', 10)

    await pool.query('DELETE FROM usuarios')
    await pool.query('INSERT INTO usuarios (nombre, email, password, rol) VALUES ($1,$2,$3,$4)', ['Jose Chacin', 'admin@chacinpos.cl', hash1, 'administrador'])
    await pool.query('INSERT INTO usuarios (nombre, email, password, rol) VALUES ($1,$2,$3,$4)', ['Ana Martinez', 'cajera@chacinpos.cl', hash2, 'cajero'])
    await pool.query('INSERT INTO usuarios (nombre, email, password, rol) VALUES ($1,$2,$3,$4)', ['Luis Perez', 'bodega@chacinpos.cl', hash3, 'bodega'])

    await pool.query('DELETE FROM productos')
    await pool.query(`INSERT INTO productos (nombre, codigo, categoria, tipo, precio, costo, stock, stock_min, emoji) VALUES
      ('Pan amasado', '001', 'Panaderia', 'unidad', 150, 80, 120, 20, '🍞'),
      ('Leche 1L', '002', 'Lacteos', 'unidad', 990, 700, 48, 10, '🥛'),
      ('Pollo entero', '003', 'Carniceria', 'kilo', 3490, 2100, 12, 4, '🍗'),
      ('Arroz 1kg', '004', 'Abarrotes', 'unidad', 1290, 850, 55, 15, '🍚'),
      ('Coca-Cola 2L', '005', 'Bebidas', 'unidad', 1990, 1200, 24, 6, '🥤'),
      ('Queso gauda', '006', 'Lacteos', 'kilo', 8900, 6000, 3, 2, '🧀'),
      ('Tomate', '007', 'Verduras', 'peso', 1200, 700, 30, 5, '🍅'),
      ('Azucar 1kg', '008', 'Abarrotes', 'unidad', 1100, 700, 8, 10, '🍬')
    `)

    console.log('✅ Base de datos de producción inicializada')
    process.exit(0)
  } catch (err) {
    console.error('❌ Error:', err.message)
    process.exit(1)
  }
}

seed()
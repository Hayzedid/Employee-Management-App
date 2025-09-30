const { query, pool } = require('./config/database');

async function checkDatabase() {
  try {
    console.log('🔍 Checking database structure...');
    
    // Check tables
    const tables = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('📊 Existing tables:');
    tables.rows.forEach(row => console.log(`  - ${row.table_name}`));
    
    // Check employees table structure if it exists
    if (tables.rows.some(row => row.table_name === 'employees')) {
      const columns = await query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'employees' AND table_schema = 'public'
        ORDER BY ordinal_position
      `);
      
      console.log('\n👥 Employees table columns:');
      columns.rows.forEach(row => console.log(`  - ${row.column_name} (${row.data_type})`));
    }
    
  } catch (error) {
    console.error('❌ Error checking database:', error.message);
  } finally {
    await pool.end();
  }
}

checkDatabase();

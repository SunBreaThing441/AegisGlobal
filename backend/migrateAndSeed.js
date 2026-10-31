/**
 * ==============================================================================
 * AegisGlobal / UNESCO Care Network — Master Migration & Sample Data Seeder
 * ==============================================================================
 * Creates all required application tables, indexes, and populates realistic
 * sample data for doctors, patients, appointments, prescriptions, and wallets.
 */

const fs = require('fs');
const path = require('path');
const defaultPool = require('./db');
require('dotenv').config();

async function migrateAndSeed(customPool = null) {
  const pool = customPool || defaultPool;
  console.log('\n============================================================');
  console.log('🚀 AegisGlobal: Initializing Database Migration & Seeding...');
  console.log('============================================================\n');

  let client;
  try {
    client = await pool.connect();
    console.log('✅ Connected to PostgreSQL database successfully.\n');
  } catch (err) {
    console.error('❌ Connection Failed:', err.message);
    console.log('\n💡 Tip: If using Supabase Cloud, paste the contents of:');
    console.log('   "backend/migrations/master_seed_data.sql"');
    console.log('   into the Supabase SQL Editor:');
    console.log('   https://supabase.com/dashboard/project/rmfzydycexyuhqskklgu/sql\n');
    throw err;
  }

  try {
    console.log('📦 Applying Master Migration & Sample Data...');
    const sqlPath = path.join(__dirname, 'migrations', 'master_seed_data.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    // Execute the master SQL script
    await client.query(sqlContent);

    console.log('============================================================');
    console.log('🎉 Migration & Seeding Completed Successfully!');
    console.log('============================================================\n');
    console.log('🔑 TEST LOGIN CREDENTIALS (All use password: Test@123):');
    console.log('------------------------------------------------------------');
    console.log('👤 Patient Account:    patient@aegisglobal.org');
    console.log('🩺 Doctor Specialist:  dr.elena@aegisglobal.org');
    console.log('🚨 Emergency Doctor:   dr.amara@aegisglobal.org');
    console.log('🛡️ Admin Account:      admin@aegisglobal.org');
    console.log('------------------------------------------------------------\n');

    return { success: true };
  } catch (err) {
    console.error('❌ Migration Error:', err.message);
    throw err;
  } finally {
    if (client) client.release();
    if (!customPool && pool.end && !pool._isPGlite) await pool.end();
  }
}

// Enable standalone CLI execution
if (require.main === module) {
  migrateAndSeed().then(() => process.exit(0)).catch((err) => {
    console.error('Fatal execution error:', err.message);
    process.exit(1);
  });
}

module.exports = { migrateAndSeed };

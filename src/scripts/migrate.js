// One-off schema-drift fixer for databases created before the `holidays` table
// and `donations.payment_mode` column existed. Safe to run repeatedly — every
// change is guarded by an existence check first. Run with: npm run migrate
const mysql = require('mysql2/promise');
require('dotenv').config();

async function columnExists(conn, dbName, table, column) {
  const [rows] = await conn.query(
    `SELECT COUNT(*) AS cnt FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [dbName, table, column]
  );
  return rows[0].cnt > 0;
}

async function tableExists(conn, dbName, table) {
  const [rows] = await conn.query(
    `SELECT COUNT(*) AS cnt FROM information_schema.TABLES
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?`,
    [dbName, table]
  );
  return rows[0].cnt > 0;
}

async function migrate() {
  const dbName = process.env.DB_NAME;
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: dbName,
  });

  console.log(`Connected to "${dbName}". Checking schema...`);

  if (!(await tableExists(conn, dbName, 'donations'))) {
    console.log('⚠️  donations table does not exist yet — skipping payment_mode check (run seed/sync first).');
  } else if (!(await columnExists(conn, dbName, 'donations', 'payment_mode'))) {
    console.log('Adding donations.payment_mode ...');
    await conn.query(
      "ALTER TABLE `donations` ADD COLUMN `payment_mode` varchar(255) DEFAULT NULL AFTER `donation_date`"
    );
    console.log('✅ donations.payment_mode added.');
  } else {
    console.log('✓ donations.payment_mode already exists, skipping.');
  }

  if (!(await tableExists(conn, dbName, 'holidays'))) {
    console.log('Creating holidays table ...');
    await conn.query(`
      CREATE TABLE IF NOT EXISTS \`holidays\` (
        \`id\` varchar(36) NOT NULL,
        \`date\` date NOT NULL UNIQUE,
        \`label\` varchar(255) DEFAULT NULL,
        \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('✅ holidays table created.');
  } else {
    console.log('✓ holidays table already exists, skipping.');
  }

  await conn.end();
  console.log('Migration complete.');
}

migrate().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});

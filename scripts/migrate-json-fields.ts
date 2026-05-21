import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 30000,
});

async function migrate() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Verify current column types before changing
    const { rows: before } = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'ServiceOrder'
        AND column_name IN ('services', 'partsUsed')
    `);
    console.log('Tipos ANTES da migração:', before);

    // Sample data integrity check
    const { rows: samples } = await client.query(`
      SELECT id, services, "partsUsed"
      FROM "ServiceOrder"
      LIMIT 5
    `);
    console.log('Amostra de dados:', samples);

    // Drop existing text defaults before type change (required by Postgres)
    console.log('\nRemovendo defaults temporariamente...');
    await client.query(`
      ALTER TABLE "ServiceOrder"
        ALTER COLUMN "services" DROP DEFAULT,
        ALTER COLUMN "partsUsed" DROP DEFAULT
    `);

    // Convert using USING clause — safe in-place cast
    console.log('Convertendo "services" TEXT → JSONB...');
    await client.query(`
      ALTER TABLE "ServiceOrder"
        ALTER COLUMN "services" TYPE JSONB USING "services"::JSONB
    `);

    console.log('Convertendo "partsUsed" TEXT → JSONB...');
    await client.query(`
      ALTER TABLE "ServiceOrder"
        ALTER COLUMN "partsUsed" TYPE JSONB USING "partsUsed"::JSONB
    `);

    // Restore defaults as native JSONB
    console.log('Restaurando defaults como JSONB...');
    await client.query(`
      ALTER TABLE "ServiceOrder"
        ALTER COLUMN "services" SET DEFAULT '[]'::JSONB,
        ALTER COLUMN "partsUsed" SET DEFAULT '[]'::JSONB
    `);

    // Verify after
    const { rows: after } = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'ServiceOrder'
        AND column_name IN ('services', 'partsUsed')
    `);
    console.log('\nTipos DEPOIS da migração:', after);

    await client.query('COMMIT');
    console.log('\n✓ Migração concluída com sucesso!');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('ERRO — rollback efetuado:', e);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();

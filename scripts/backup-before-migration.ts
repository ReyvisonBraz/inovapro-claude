import 'dotenv/config';
import pg from 'pg';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 30000,
});

async function backup() {
  const dir = join(process.cwd(), 'backups');
  mkdirSync(dir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const client = await pool.connect();

  try {
    console.log('Conectado. Iniciando backup...');

    const { rows: transactions } = await client.query('SELECT * FROM "Transaction"');
    const txPath = join(dir, `transactions_${timestamp}.json`);
    writeFileSync(txPath, JSON.stringify(transactions, null, 2), 'utf-8');
    console.log(`✓ Transactions: ${transactions.length} registros → backups/transactions_${timestamp}.json`);

    const { rows: serviceOrders } = await client.query('SELECT * FROM "ServiceOrder"');
    const osPath = join(dir, `service_orders_${timestamp}.json`);
    writeFileSync(osPath, JSON.stringify(serviceOrders, null, 2), 'utf-8');
    console.log(`✓ ServiceOrders: ${serviceOrders.length} registros → backups/service_orders_${timestamp}.json`);

    const { rows: clientPayments } = await client.query('SELECT * FROM "ClientPayment"');
    const cpPath = join(dir, `client_payments_${timestamp}.json`);
    writeFileSync(cpPath, JSON.stringify(clientPayments, null, 2), 'utf-8');
    console.log(`✓ ClientPayments: ${clientPayments.length} registros → backups/client_payments_${timestamp}.json`);

    console.log('\nBackup concluído com sucesso!');
  } finally {
    client.release();
    await pool.end();
  }
}

backup().catch((e) => {
  console.error('Erro no backup:', e.message);
  process.exit(1);
});

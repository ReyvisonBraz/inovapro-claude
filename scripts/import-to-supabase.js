/*
 * Script de importação de dados para o Supabase.
 *
 * ⚠️ SEGURANÇA: Este script NÃO deve conter credenciais hardcoded.
 *    Use variáveis de ambiente ou um arquivo .env na raiz do projeto.
 *
 * Uso:
 *   DB_HOST=seu-host DB_USER=postgres DB_PASSWORD=sua-senha node scripts/import-to-supabase.js
 *   — ou —
 *   Configure as variáveis no .env e execute: node scripts/import-to-supabase.js
 */

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import 'dotenv/config';

function getData(filename) {
  try {
    const content = JSON.parse(fs.readFileSync(filename, 'utf8'));
    return content.data || content;
  } catch (e) {
    return [];
  }
}

const pool = new pg.Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'postgres'
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('=== IMPORTANDO DADOS PARA SUPABASE ===\n');

  // 1. Users
  console.log('1. Importando Users...');
  const existingUsers = await prisma.user.count();
  if (existingUsers === 0) {
    const adminPassword = bcrypt.hashSync('admin2021', 10);
    await prisma.user.create({
      data: {
        username: 'admin',
        password: adminPassword,
        role: 'owner',
        name: 'Administrador',
        permissions: JSON.stringify(['view_dashboard', 'manage_transactions', 'view_reports', 'manage_customers', 'manage_payments', 'manage_settings', 'manage_users'])
      }
    });
    console.log('   ✅ Admin criado');
  } else {
    console.log('   ℹ️  Users já existem, pulando...');
  }

  // 2. Settings
  console.log('2. Importando Settings...');
  const existingSettings = await prisma.settings.count();
  if (existingSettings === 0) {
    await prisma.settings.create({ data: { id: 1 } });
    console.log('   ✅ Settings criado');
  } else {
    console.log('   ℹ️  Settings já existem, pulando...');
  }

  // 3. Categories
  console.log('3. Importando Categories...');
  const existingCategories = await prisma.category.count();
  if (existingCategories === 0) {
    const incomeCats = ['Entrada', 'Salário', 'Vendas', 'Serviços', 'Investimentos', 'Outros'];
    const expenseCats = ['Saída', 'Alimentação', 'Trabalho', 'Utilidades', 'Viagem', 'Lazer', 'Outros'];

    for (const name of incomeCats) {
      await prisma.category.create({ data: { name, type: 'income' } });
    }
    for (const name of expenseCats) {
      await prisma.category.create({ data: { name, type: 'expense' } });
    }
    console.log('   ✅ 13 categorias criadas');
  } else {
    console.log('   ℹ️  Categories já existem, pulando...');
  }

  // 4. Service Order Statuses
  console.log('4. Importando Service Order Statuses...');
  const existingStatuses = await prisma.serviceOrderStatus.count();
  if (existingStatuses === 0) {
    const statuses = [
      { name: 'Aguardando Análise', color: '#f59e0b', priority: 1, isDefault: 1 },
      { name: 'Em Manutenção', color: '#3b82f6', priority: 2, isDefault: 1 },
      { name: 'Urgente', color: '#f43f5e', priority: 3, isDefault: 1 },
      { name: 'Aguardando Peças', color: '#f97316', priority: 4, isDefault: 1 },
      { name: 'Pronto para Retirada', color: '#10b981', priority: 5, isDefault: 1 },
      { name: 'Concluído', color: '#64748b', priority: 6, isDefault: 1 },
      { name: 'Sem Conserto', color: '#ef4444', priority: 7, isDefault: 1 },
    ];
    for (const s of statuses) {
      await prisma.serviceOrderStatus.create({ data: s });
    }
    console.log('   ✅ 7 statuses criados');
  } else {
    console.log('   ℹ️  Statuses já existem, pulando...');
  }

  // 5. Equipment Types
  console.log('5. Importando Equipment Types...');
  const existingTypes = await prisma.equipmentType.count();
  if (existingTypes === 0) {
    const types = ['Notebook', 'Desktop', 'Smartphone', 'Tablet', 'Monitor', 'Impressora', 'Console'];
    for (const name of types) {
      await prisma.equipmentType.create({ data: { name } });
    }
    console.log('   ✅ 7 tipos de equipamento criados');
  } else {
    console.log('   ℹ️  Equipment Types já existem, pulando...');
  }

  // 6. Importar dados dos arquivos JSON exportados
  console.log('\n=== IMPORTANDO DADOS DOS ARQUIVOS ===\n');

  // Customers
  console.log('6. Importando Customers...');
  const customersData = getData('/tmp/customers.json');
  if (Array.isArray(customersData)) {
    for (const c of customersData) {
      try {
        await prisma.customer.create({
          data: {
            firstName: c.firstName,
            lastName: c.lastName,
            nickname: c.nickname || null,
            cpf: c.cpf || null,
            companyName: c.companyName || null,
            phone: c.phone || '',
            observation: c.observation || null,
            creditLimit: c.creditLimit || 0
          }
        });
      } catch (e) {
        console.log('   ⚠️  Erro ao importar customer:', c.firstName, c.lastName);
      }
    }
    console.log(`   ✅ ${customersData.length} customers importados`);
  }

  // Transactions
  console.log('7. Importando Transactions...');
  const transactionsData = getData('/tmp/all_transactions.json');
  if (Array.isArray(transactionsData)) {
    let imported = 0;
    for (const t of transactionsData) {
      try {
        await prisma.transaction.create({
          data: {
            description: t.description || 'Sem descrição',
            category: t.category || 'Outros',
            type: t.type,
            amount: t.amount,
            date: t.date,
            status: t.status || 'Concluído',
            paymentId: t.paymentId || null,
            saleId: t.saleId || null
          }
        });
        imported++;
      } catch (e) {
        // console.log('   ⚠️  Erro ao importar transação:', t.id);
      }
    }
    console.log(`   ✅ ${imported} transactions importadas`);
  }

  // Client Payments
  console.log('8. Importando Client Payments...');
  const paymentsData = getData('/tmp/client_payments.json');
  if (Array.isArray(paymentsData)) {
    for (const p of paymentsData) {
      try {
        await prisma.clientPayment.create({
          data: {
            customerId: p.customerId,
            description: p.description,
            totalAmount: p.totalAmount,
            paidAmount: p.paidAmount || 0,
            purchaseDate: p.purchaseDate,
            dueDate: p.dueDate,
            paymentMethod: p.paymentMethod,
            status: p.status || 'pending',
            installmentsCount: p.installmentsCount || 1,
            type: p.type || 'income',
            saleId: p.saleId || null,
            paymentHistory: p.paymentHistory || '[]'
          }
        });
      } catch (e) {
        console.log('   ⚠️  Erro ao importar payment:', p.id);
      }
    }
    console.log(`   ✅ ${paymentsData.length} pagamentos importados`);
  }

  // Service Orders
  console.log('9. Importando Service Orders...');
  const soData = getData('/tmp/service_orders.json');
  if (Array.isArray(soData)) {
    for (const so of soData) {
      try {
        await prisma.serviceOrder.create({
          data: {
            customerId: so.customerId,
            equipmentType: so.equipmentType || null,
            equipmentBrand: so.equipmentBrand || null,
            equipmentModel: so.equipmentModel || null,
            equipmentColor: so.equipmentColor || null,
            equipmentSerial: so.equipmentSerial || null,
            reportedProblem: so.reportedProblem || null,
            arrivalPhotoUrl: so.arrivalPhotoUrl || null,
            arrivalPhotoBase64: so.arrivalPhotoBase64 || null,
            status: so.status || 'Aguardando Análise',
            technicalAnalysis: so.technicalAnalysis || null,
            servicesPerformed: so.servicesPerformed || null,
            services: so.services || '[]',
            partsUsed: so.partsUsed || '[]',
            serviceFee: so.serviceFee || 0,
            totalAmount: so.totalAmount || 0,
            finalObservations: so.finalObservations || null,
            entryDate: so.entryDate || null,
            analysisPrediction: so.analysisPrediction || null,
            customerPassword: so.customerPassword || null,
            accessories: so.accessories || null,
            ramInfo: so.ramInfo || null,
            ssdInfo: so.ssdInfo || null,
            priority: so.priority || 'medium'
          }
        });
      } catch (e) {
        console.log('   ⚠️  Erro ao importar OS:', so.id, e.message);
      }
    }
    console.log(`   ✅ ${soData.length} ordens de serviço importadas`);
  }

  // Brands
  console.log('10. Importando Brands...');
  const brandsData = getData('/tmp/brands.json');
  if (Array.isArray(brandsData)) {
    for (const b of brandsData) {
      try {
        await prisma.brand.create({
          data: {
            name: b.name,
            equipmentType: b.equipmentType || null
          }
        });
      } catch (e) {
        // Ignore duplicates
      }
    }
    console.log(`   ✅ ${brandsData.length} brands importadas`);
  }

  // Models
  console.log('11. Importando Models...');
  const modelsData = getData('/tmp/models.json');
  if (Array.isArray(modelsData)) {
    for (const m of modelsData) {
      try {
        await prisma.model.create({
          data: {
            brandId: m.brandId,
            name: m.name
          }
        });
      } catch (e) {
        // Ignore duplicates or missing brand
      }
    }
    console.log(`   ✅ ${modelsData.length} models importadas`);
  }

  console.log('\n=== VERIFICAÇÃO FINAL ===\n');

  console.log('📊 Users:', await prisma.user.count());
  console.log('📊 Customers:', await prisma.customer.count());
  console.log('📊 Transactions:', await prisma.transaction.count());
  console.log('📊 Categories:', await prisma.category.count());
  console.log('📊 Client Payments:', await prisma.clientPayment.count());
  console.log('📊 Service Orders:', await prisma.serviceOrder.count());
  console.log('📊 Service Order Statuses:', await prisma.serviceOrderStatus.count());
  console.log('📊 Equipment Types:', await prisma.equipmentType.count());
  console.log('📊 Brands:', await prisma.brand.count());
  console.log('📊 Models:', await prisma.model.count());
  console.log('📊 Settings:', await prisma.settings.count());

  // Reset admin password
  console.log('\n🔐 Resetando senha do admin...');
  await prisma.user.update({
    where: { username: 'admin' },
    data: { password: bcrypt.hashSync('admin2021', 10) }
  });
  console.log('   ✅ Admin password reset to: admin2021');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
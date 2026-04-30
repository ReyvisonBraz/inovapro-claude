import 'dotenv/config';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import fs from 'fs';

const db = new Database('./data/finance.db');

console.log('=== IMPORTANDO DADOS DO RAILWAY ===\n');

// 1. Importar Users
console.log('1. Importando Users...');
const users = JSON.parse(fs.readFileSync('/tmp/users.json', 'utf8'));
const insertUser = db.prepare(`
  INSERT OR REPLACE INTO users (id, username, password, role, name, permissions, createdAt)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

const hashPassword = (password) => bcrypt.hashSync(password, 10);

users.forEach(u => {
  // Gerar senha padrão para usuários sem senha (exceto admin)
  let password = u.password;
  if (!password || password.length < 10) {
    password = u.username === 'admin'
      ? hashPassword('admin2021')
      : hashPassword('changeme123'); // senha padrão
  }
  insertUser.run(u.id, u.username, password, u.role, u.name, JSON.stringify(u.permissions || []), u.createdAt);
});
console.log(`   ✅ ${users.length} users`);

// 2. Importar Customers
console.log('2. Importando Customers...');
const customers = JSON.parse(fs.readFileSync('/tmp/customers.json', 'utf8')).data;
const insertCustomer = db.prepare(`
  INSERT OR REPLACE INTO customers (id, firstName, lastName, nickname, cpf, companyName, phone, observation, creditLimit, createdAt, createdBy)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

customers.forEach(c => {
  insertCustomer.run(
    c.id, c.firstName, c.lastName, c.nickname, c.cpf, c.companyName,
    c.phone, c.observation, c.creditLimit || 0, c.createdAt, c.createdBy || 1
  );
});
console.log(`   ✅ ${customers.length} customers`);

// 3. Importar Categories
console.log('3. Importando Categories...');
const categories = JSON.parse(fs.readFileSync('/tmp/categories.json', 'utf8'));
const insertCategory = db.prepare(`
  INSERT OR REPLACE INTO categories (id, name, type)
  VALUES (?, ?, ?)
`);

categories.forEach(c => {
  insertCategory.run(c.id, c.name, c.type);
});
console.log(`   ✅ ${categories.length} categories`);

// 4. Importar Transactions (usar arquivo completo com todas as páginas)
console.log('4. Importando Transactions...');
const transactions = JSON.parse(fs.readFileSync('/tmp/all_transactions.json', 'utf8'));
const insertTransaction = db.prepare(`
  INSERT OR REPLACE INTO transactions (id, description, category, type, amount, date, status, createdBy, updatedBy, paymentId, saleId)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

transactions.forEach(t => {
  insertTransaction.run(
    t.id, t.description, t.category, t.type, t.amount, t.date,
    t.status || 'Concluído', t.createdBy, t.updatedBy, t.paymentId, t.saleId
  );
});
console.log(`   ✅ ${transactions.length} transactions`);

// 5. Importar Client Payments
console.log('5. Importando Client Payments...');
const payments = JSON.parse(fs.readFileSync('/tmp/client_payments.json', 'utf8')).data;
const insertPayment = db.prepare(`
  INSERT OR REPLACE INTO client_payments
  (id, customerId, description, totalAmount, paidAmount, purchaseDate, dueDate, paymentMethod, status, installmentsCount, type, saleId, paymentHistory, createdBy)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

payments.forEach(p => {
  insertPayment.run(
    p.id, p.customerId, p.description, p.totalAmount, p.paidAmount || 0,
    p.purchaseDate, p.dueDate, p.paymentMethod, p.status || 'pending',
    p.installmentsCount || 1, p.type || 'income', p.saleId,
    p.paymentHistory || '[]', p.createdBy || 1
  );
});
console.log(`   ✅ ${payments.length} client payments`);

// 6. Importar Service Orders
console.log('6. Importando Service Orders...');
const serviceOrders = JSON.parse(fs.readFileSync('/tmp/service_orders.json', 'utf8')).data;
const insertServiceOrder = db.prepare(`
  INSERT OR REPLACE INTO service_orders
  (id, customerId, equipmentType, equipmentBrand, equipmentModel, equipmentColor, equipmentSerial,
   reportedProblem, arrivalPhotoUrl, arrivalPhotoBase64, status, technicalAnalysis, servicesPerformed,
   services, partsUsed, serviceFee, totalAmount, finalObservations, entryDate, analysisPrediction,
   customerPassword, accessories, ramInfo, ssdInfo, priority, createdAt, createdBy, updatedBy)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

serviceOrders.forEach(so => {
  insertServiceOrder.run(
    so.id, so.customerId, so.equipmentType, so.equipmentBrand, so.equipmentModel,
    so.equipmentColor || null, so.equipmentSerial || null,
    so.reportedProblem, so.arrivalPhotoUrl, so.arrivalPhotoBase64,
    so.status || 'Aguardando Análise', so.technicalAnalysis || null, so.servicesPerformed || null,
    JSON.stringify(so.services || []), JSON.stringify(so.partsUsed || []),
    so.serviceFee || 0, so.totalAmount || 0, so.finalObservations || null,
    so.entryDate || null, so.analysisPrediction || null,
    so.customerPassword || null, so.accessories || null,
    so.ramInfo || null, so.ssdInfo || null,
    so.priority || 'medium', so.createdAt, so.createdBy || 1, so.updatedBy
  );
});
console.log(`   ✅ ${serviceOrders.length} service orders`);

// 7. Importar Service Order Statuses
console.log('7. Importando Service Order Statuses...');
const sos = JSON.parse(fs.readFileSync('/tmp/service_order_statuses.json', 'utf8'));
const insertSoStatus = db.prepare(`
  INSERT OR REPLACE INTO service_order_statuses (id, name, color, priority, isDefault)
  VALUES (?, ?, ?, ?, ?)
`);

sos.forEach(s => {
  insertSoStatus.run(s.id, s.name, s.color, s.priority || 0, s.isDefault ? 1 : 0);
});
console.log(`   ✅ ${sos.length} service order statuses`);

// 8. Importar Equipment Types
console.log('8. Importando Equipment Types...');
const eqTypes = JSON.parse(fs.readFileSync('/tmp/equipment_types.json', 'utf8'));
const insertEqType = db.prepare(`
  INSERT OR REPLACE INTO equipment_types (id, name, icon)
  VALUES (?, ?, ?)
`);

eqTypes.forEach(e => {
  insertEqType.run(e.id, e.name, e.icon || null);
});
console.log(`   ✅ ${eqTypes.length} equipment types`);

// 9. Importar Brands
console.log('9. Importando Brands...');
const brands = JSON.parse(fs.readFileSync('/tmp/brands.json', 'utf8'));
const insertBrand = db.prepare(`
  INSERT OR REPLACE INTO brands (id, name, equipmentType)
  VALUES (?, ?, ?)
`);

brands.forEach(b => {
  insertBrand.run(b.id, b.name, b.equipmentType || null);
});
console.log(`   ✅ ${brands.length} brands`);

// 10. Importar Models
console.log('10. Importando Models...');
const models = JSON.parse(fs.readFileSync('/tmp/models.json', 'utf8'));
const insertModel = db.prepare(`
  INSERT OR REPLACE INTO models (id, brandId, name)
  VALUES (?, ?, ?)
`);

models.forEach(m => {
  insertModel.run(m.id, m.brandId, m.name);
});
console.log(`   ✅ ${models.length} models`);

// 11. Importar Settings
console.log('11. Importando Settings...');
const settings = JSON.parse(fs.readFileSync('/tmp/settings.json', 'utf8'));
db.prepare(`
  UPDATE settings SET
    appName = ?, appVersion = ?, fiscalYear = ?, primaryColor = ?,
    categories = ?, incomeCategories = ?, expenseCategories = ?,
    profileName = ?, profileAvatar = ?, initialBalance = ?,
    showWarnings = ?, hiddenColumns = ?, settingsPassword = ?,
    receiptLayout = ?, receiptLogo = ?,
    whatsappBillingTemplate = ?, whatsappOSTemplate = ?
  WHERE id = 1
`).run(
  settings.appName, settings.appVersion, settings.fiscalYear, settings.primaryColor,
  settings.categories, settings.incomeCategories, settings.expenseCategories,
  settings.profileName, settings.profileAvatar, settings.initialBalance || 0,
  settings.showWarnings ? 1 : 0, JSON.stringify(settings.hiddenColumns || []),
  settings.settingsPassword || '', settings.receiptLayout || 'a4', settings.receiptLogo || '',
  settings.whatsappBillingTemplate || '', settings.whatsappOSTemplate || ''
);
console.log(`   ✅ Settings importado`);

// 12. Reset password do admin
console.log('\n12. Resetando senha do admin...');
const adminHash = bcrypt.hashSync('admin2021', 10);
db.prepare('UPDATE users SET password = ? WHERE username = ?').run(adminHash, 'admin');
console.log('   ✅ Admin password reset to: admin2021');

console.log('\n=== IMPORTAÇÃO CONCLUÍDA! ===');
console.log('\nDados importados:');
console.log(`  - ${users.length} usuários`);
console.log(`  - ${customers.length} clientes`);
console.log(`  - ${categories.length} categorias`);
console.log(`  - ${transactions.length} transações`);
console.log(`  - ${payments.length} pagamentos`);
console.log(`  - ${serviceOrders.length} ordens de serviço`);
console.log(`  - ${sos.length} status de OS`);
console.log(`  - ${eqTypes.length} tipos de equipamento`);
console.log(`  - ${brands.length} marcas`);
console.log(`  - ${models.length} modelos`);
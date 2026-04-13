/**
 * Script de Migração de Senhas para bcrypt
 * 
 * Executar: npx tsx scripts/migratePasswords.ts
 * 
 * Este script:
 * 1. Lê todos os usuários do banco
 * 2. Verifica se a senha já é um hash bcrypt
 * 3. Se não for, faz o hash e atualiza no banco
 * 4. Mantém credenciais funcionando após migração
 */

import Database from 'better-sqlite3'
import bcrypt from 'bcryptjs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Caminho para o banco (relativo ao projeto)
const DB_PATH = join(__dirname, '..', 'finance.db')

console.log('='.repeat(50))
console.log('MIGRAÇÃO DE SENHAS PARA BCRYPT')
console.log('='.repeat(50))
console.log()

const db = new Database(DB_PATH, { verbose: console.log })

try {
  // Buscar todos os usuários
  const users = db.prepare('SELECT id, username, password FROM users').all() as {
    id: number
    username: string
    password: string
  }[]

  console.log(`Encontrados ${users.length} usuários`)
  console.log()

  let migrated = 0
  let alreadyHashed = 0

  for (const user of users) {
    // Verificar se já é um hash bcrypt
    if (user.password.startsWith('$2')) {
      console.log(`[JÁ HASH] Usuário ${user.id} (${user.username}): senha já é hash bcrypt`)
      alreadyHashed++
      continue
    }

    // Fazer hash da senha atual
    const hashedPassword = bcrypt.hashSync(user.password, 10)

    // Atualizar no banco
    const stmt = db.prepare('UPDATE users SET password = ? WHERE id = ?')
    stmt.run(hashedPassword, user.id)

    console.log(`[MIGRADO] Usuário ${user.id} (${user.username}): "${user.password}" → "${hashedPassword.substring(0, 20)}..."`)
    migrated++
  }

  console.log()
  console.log('='.repeat(50))
  console.log('RESULTADO DA MIGRAÇÃO')
  console.log('='.repeat(50))
  console.log(`Total de usuários: ${users.length}`)
  console.log(`Já eram hashes: ${alreadyHashed}`)
  console.log(`Migrações feitas: ${migrated}`)
  console.log()

  if (migrated > 0) {
    console.log('✅ Migração concluída com sucesso!')
    console.log('   As senhas anteriores continuam funcionando.')
  } else {
    console.log('ℹ️  Nenhuma migração necessária - todas as senhas já são hashes.')
  }

  console.log()
  console.log('NOTA: Após verificar que o login funciona, remova este script')
  console.log('      do diretório para segurança.')

} catch (error) {
  console.error('❌ ERRO NA MIGRAÇÃO:', error)
  process.exit(1)
} finally {
  db.close()
}

const fs = require('fs');

let code = fs.readFileSync('server.ts', 'utf8');

// 1. Replace better-sqlite3 import with Prisma
code = code.replace(
  'import Database from "better-sqlite3";',
  'import { PrismaClient } from "@prisma/client";\nconst prisma = new PrismaClient();'
);

// 2. Remove the old db instantiation
code = code.replace(
  'const db = new Database("finance.db");',
  `// Prisma wrapper for SQLite syntax compatibility
const db = {
  prepare: (query) => {
    let index = 1;
    const pgQuery = query.replace(/\\?/g, () => \`$\${index++}\`);
    return {
      get: async (...params) => {
        const res = await prisma.$queryRawUnsafe(pgQuery, ...params);
        return res[0];
      },
      all: async (...params) => {
        return await prisma.$queryRawUnsafe(pgQuery, ...params);
      },
      run: async (...params) => {
        const isInsert = pgQuery.trim().toUpperCase().startsWith('INSERT');
        let finalQuery = pgQuery;
        if (isInsert && !pgQuery.toUpperCase().includes('RETURNING')) {
          finalQuery += ' RETURNING id';
        }
        if (isInsert) {
          const res = await prisma.$queryRawUnsafe(finalQuery, ...params);
          return { lastInsertRowid: res[0]?.id || res[0]?.ID };
        } else {
          const changes = await prisma.$executeRawUnsafe(finalQuery, ...params);
          return { changes };
        }
      }
    };
  },
  exec: async (query) => {
    // Split by semicolons and run each statement
    const statements = query.split(';').filter(s => s.trim().length > 0);
    for (const stmt of statements) {
      try {
        await prisma.$executeRawUnsafe(stmt);
      } catch (e) {
        // Ignore table creation errors or duplicate column errors
      }
    }
  }
};`
);

// 3. Convert db.prepare().* and other calls to await
code = code.replace(/db\.prepare\((.*?)\)\.(get|all|run)\(/g, 'await db.prepare($1).$2(');
code = code.replace(/insertCat\.run\(/g, 'await insertCat.run(');
code = code.replace(/insertStatus\.run\(/g, 'await insertStatus.run(');
code = code.replace(/insertType\.run\(/g, 'await insertType.run(');
code = code.replace(/insert\.run\(/g, 'await insert.run(');
code = code.replace(/db\.exec\(/g, 'await db.exec(');
code = code.replace(/getPaginatedData\(/g, 'await getPaginatedData(');

// 4. Update function getPaginatedData to async
code = code.replace(
  /function getPaginatedData\(/g,
  'async function getPaginatedData('
);

// 5. Update app.get, app.post, etc. to async
code = code.replace(/app\.(get|post|put|delete)\("(.*?)", \(req, res\) => {/g, 'app.$1("$2", async (req, res) => {');
code = code.replace(/app\.(get|post|put|delete)\('(.*?)', \(req, res\) => {/g, 'app.$1("$2", async (req, res) => {');
// specifically the generic ones
code = code.replace(/app\.post\('\/api\/login', \(req, res\) => {/g, 'app.post("/api/login", async (req, res) => {');

// 6. Handle some immediate async callbacks if needed (e.g. migrations.forEach)
code = code.replace(/migrations\.forEach\(m => {/g, 'for (const m of migrations) {');
code = code.replace(/}\);\n\n\/\/ Inserir usuário Admin/g, '}\n\n// Inserir usuário Admin'); // fix the closing of forEach
// Need a better way to fix the migrations.forEach -> for...of
code = code.replace(/migrations\.forEach\((m) => {([\s\S]*?)}\);/g, 'for (const $1 of migrations) {$2}');

// For initial data arrays
code = code.replace(/income\.forEach\(c => (await insertCat\.run\(.*?)\);/g, 'for (const c of income) { $1; }');
code = code.replace(/expense\.forEach\(c => (await insertCat\.run\(.*?)\);/g, 'for (const c of expense) { $1; }');
code = code.replace(/defaultTypes\.forEach\(t => (await insertType\.run\(.*?)\);/g, 'for (const t of defaultTypes) { $1; }');
code = code.replace(/optionalEnvVars\.forEach\(v => {([\s\S]*?)}\);/g, 'for (const v of optionalEnvVars) {$1}');


fs.writeFileSync('server.ts', code);
console.log('Migration script completed.');

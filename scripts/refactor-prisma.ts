import { Project, SyntaxKind, CallExpression } from 'ts-morph';

const project = new Project();
project.addSourceFileAtPath('server.ts');
const sourceFile = project.getSourceFileOrThrow('server.ts');

console.log('Replacing better-sqlite3 with Prisma wrapper...');

// 1. Remove better-sqlite3 import
const imports = sourceFile.getImportDeclarations();
for (const imp of imports) {
  if (imp.getModuleSpecifierValue() === 'better-sqlite3') {
    imp.remove();
  }
}

// 2. Add Prisma imports
sourceFile.insertImportDeclaration(0, {
  moduleSpecifier: '@prisma/client',
  namedImports: ['PrismaClient']
});
sourceFile.insertImportDeclaration(1, {
  moduleSpecifier: '@prisma/adapter-pg',
  namedImports: ['PrismaPg']
});
sourceFile.insertImportDeclaration(2, {
  moduleSpecifier: 'pg',
  defaultImport: 'pkg'
});

// 3. Replace db instantiation
const dbInit = sourceFile.getVariableStatement(stmt => {
  return stmt.getText().includes('new Database');
});
if (dbInit) {
  dbInit.replaceWithText(`const { Pool } = pkg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Prisma wrapper for SQLite syntax compatibility
const db = {
  prepare: (query: string) => {
    let index = 1;
    const pgQuery = query.replace(/\\?/g, () => \`$\${index++}\`);
    return {
      get: async (...params: any[]) => {
        const res = await prisma.$queryRawUnsafe<any[]>(pgQuery, ...params);
        return res[0];
      },
      all: async (...params: any[]) => {
        return await prisma.$queryRawUnsafe<any[]>(pgQuery, ...params);
      },
      run: async (...params: any[]) => {
        const isInsert = pgQuery.trim().toUpperCase().startsWith('INSERT');
        let finalQuery = pgQuery;
        if (isInsert && !pgQuery.toUpperCase().includes('RETURNING')) {
          finalQuery += ' RETURNING id';
        }
        if (isInsert) {
          const res = await prisma.$queryRawUnsafe<any[]>(finalQuery, ...params);
          return { lastInsertRowid: res[0]?.id || res[0]?.ID };
        } else {
          const changes = await prisma.$executeRawUnsafe(finalQuery, ...params);
          return { changes };
        }
      }
    };
  },
  exec: async (query: string) => {
    const statements = query.split(';').filter((s: string) => s.trim().length > 0);
    for (const stmt of statements) {
      try {
        await prisma.$executeRawUnsafe(stmt);
      } catch (e) { }
    }
  }
};`);
}

// Helper to make parent function async
function makeParentFunctionAsync(node) {
  const func = node.getFirstAncestorByKind(SyntaxKind.ArrowFunction) || 
               node.getFirstAncestorByKind(SyntaxKind.FunctionDeclaration) ||
               node.getFirstAncestorByKind(SyntaxKind.FunctionExpression);
  
  if (func && !func.isAsync()) {
    func.setIsAsync(true);
  }
  return func;
}

console.log('Adding await to db.prepare().run(), get(), all()...');
// 4. Find all `db.prepare(..).run/get/all` and `db.exec` and add await
const callExpressions = sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression).sort((a, b) => b.getStart() - a.getStart());

for (const call of callExpressions) {
  if (call.wasForgotten()) continue;
  const expr = call.getExpression();
  const text = expr.getText();
  
  if (text.endsWith('.get') || text.endsWith('.run') || text.endsWith('.all')) {
    // Check if the caller is db.prepare or a variable that holds it
    const propAccess = expr.asKind(SyntaxKind.PropertyAccessExpression);
    if (propAccess) {
      const callerText = propAccess.getExpression().getText();
      // If it looks like a prepare call or a variable like insertCat
      if (callerText.includes('db.prepare') || callerText === 'insertCat' || callerText === 'insertStatus' || callerText === 'insertType' || callerText === 'insert') {
        if (!call.getParentIfKind(SyntaxKind.AwaitExpression)) {
          makeParentFunctionAsync(call);
          call.replaceWithText(`await ${call.getText()}`);
        }
      }
    }
  } else if (text === 'db.exec' || text === 'getPaginatedData') {
    if (!call.getParentIfKind(SyntaxKind.AwaitExpression)) {
      makeParentFunctionAsync(call);
      call.replaceWithText(`await ${call.getText()}`);
    }
  }
}

// 5. Some forEach loops contain await now, which is invalid in JS. Let's fix migrations and arrays.
const forEachCalls = sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression).filter(c => c.getExpression().getText().endsWith('.forEach')).sort((a, b) => b.getStart() - a.getStart());
for (const fe of forEachCalls) {
    if (fe.wasForgotten()) continue;
    const args = fe.getArguments();
    if (args.length > 0 && (args[0].getKind() === SyntaxKind.ArrowFunction || args[0].getKind() === SyntaxKind.FunctionExpression)) {
        const func = args[0];
        // If the function is async, we should convert to for...of
        if (func.isAsync()) {
            const arrayText = fe.getExpression().asKind(SyntaxKind.PropertyAccessExpression)?.getExpression().getText();
            const param = func.getParameters()[0]?.getName() || 'item';
            const body = func.getBodyText();
            if (arrayText && body) {
                fe.getParentIfKind(SyntaxKind.ExpressionStatement)?.replaceWithText(`for (const ${param} of ${arrayText}) {\n${body}\n}`);
            }
        }
    }
}

console.log('Saving modifications...');
sourceFile.saveSync();
console.log('Done!');

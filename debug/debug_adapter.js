
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const Database = require('better-sqlite3');

console.log('PrismaBetterSqlite3:', PrismaBetterSqlite3);

try {
    const db = new Database('dev.db');
    console.log('DB instance created');
    const adapter = new PrismaBetterSqlite3(db);
    console.log('Adapter instance created:', adapter);
} catch (e) {
    console.error('Instantiation Error:', e);
}

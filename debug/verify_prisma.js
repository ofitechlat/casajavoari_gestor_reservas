
const { PrismaClient } = require('@prisma/client')
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3')
const Database = require('better-sqlite3')
const path = require('path')
const fs = require('fs')

async function main() {
    try {
        console.log("Starting...");
        const dbPath = path.join(process.cwd(), 'dev.db');
        const db = new Database(dbPath);
        const adapter = new PrismaBetterSqlite3(db);
        const prisma = new PrismaClient({ adapter });

        const users = await prisma.user.findMany();
        console.log("Users found (" + users.length + ")");
        fs.writeFileSync('success_check.txt', 'SUCCESS');
    } catch (e) {
        console.error("FAIL:", e);
        fs.writeFileSync('success_check.txt', 'FAIL: ' + e.message + '\n' + e.stack);
    }
}
main();

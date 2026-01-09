
import { PrismaClient } from '@prisma/client'

// Use standard Prisma Client
const prisma = new PrismaClient()

async function main() {
    try {
        console.log("Connecting to DB...");
        const users = await prisma.user.findMany();
        console.log("Users found:", users);
    } catch (e) {
        console.error("DB Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();


import prisma from './src/lib/db';

async function main() {
    console.log('Testing prisma import from lib/db...');
    try {
        const users = await prisma.user.findMany();
        console.log('Users:', users);
    } catch (e) {
        console.error('Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();

try {
    const { PrismaClient } = require('@prisma/client');
    console.log('success: @prisma/client found');
} catch (e) {
    console.error('failed:', e.message);
    process.exit(1);
}


const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
    console.log('Seeding users...')

    // Admin User
    const admin = await prisma.user.upsert({
        where: { email: 'admin@casajavorai.com' },
        update: {},
        create: {
            email: 'admin@casajavorai.com',
            name: 'Administrador',
            role: 'admin',
        },
    })
    console.log({ admin })

    // Gestor User
    const gestor = await prisma.user.upsert({
        where: { email: 'ana@casajavorai.com' },
        update: {},
        create: {
            email: 'ana@casajavorai.com',
            name: 'Ana Gestora',
            role: 'gestor',
        },
    })
    console.log({ gestor })

    // Generic User
    const user = await prisma.user.upsert({
        where: { email: 'user@casajavorai.com' },
        update: {},
        create: {
            email: 'user@casajavorai.com',
            name: 'Usuario Normal',
            role: 'user',
        },
    })
    console.log({ user })
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })

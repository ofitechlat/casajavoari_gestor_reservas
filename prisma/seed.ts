import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    // 1. Seed Users
    const admin = await prisma.user.upsert({
        where: { email: 'admin@casajavorai.com' },
        update: {},
        create: {
            email: 'admin@casajavorai.com',
            name: 'Carlos Admin',
            role: 'admin',
        },
    })

    const gestor = await prisma.user.upsert({
        where: { email: 'ana@casajavorai.com' },
        update: {},
        create: {
            email: 'ana@casajavorai.com',
            name: 'Ana Gestora',
            role: 'gestor',
        },
    })

    console.log({ admin, gestor })

    // 2. Seed Spaces
    const spacesData = [
        {
            id: 'sala',
            name: 'Sala Principal',
            description: 'Espacio cerrado ideal para talleres, conferencias y reuniones.',
            dimensions: '4x12m',
            type: 'indoor',
            hourlyRate: 15000,
            color: 'bg-blue-500',
            mapConfig: JSON.stringify({ x: 50, y: 120, width: 120, height: 40, borderRadius: 2 })
        },
        {
            id: 'verde',
            name: 'Espacio Verde Trasero',
            description: 'Área al aire libre perfecta para actividades recreativas y contacto con la naturaleza.',
            dimensions: 'Variable',
            type: 'outdoor',
            hourlyRate: 10000,
            color: 'bg-green-500',
            mapConfig: JSON.stringify({ x: 180, y: 80, width: 100, height: 100, borderRadius: 10, path: "M 0 0 Q 100 0 100 100 L 0 100 Z" })
        },
        {
            id: 'planche',
            name: 'Planché Techado',
            description: 'Espacio amplio techado con iluminación, ideal para danza y ensayos.',
            dimensions: '10x25m',
            type: 'semi-outdoor',
            hourlyRate: 20000,
            color: 'bg-orange-500',
            mapConfig: JSON.stringify({ x: 50, y: 20, width: 100, height: 90, borderRadius: 2 })
        },
        {
            id: 'multiuso',
            name: 'Sala Multiuso',
            description: 'Espacio flexible para actividades variadas.',
            dimensions: '6x5m',
            type: 'indoor',
            hourlyRate: 12000,
            color: 'bg-purple-500',
            mapConfig: JSON.stringify({ x: 160, y: 20, width: 60, height: 50, borderRadius: 2 })
        },
    ];

    for (const s of spacesData) {
        // Map existing mock "Color" to not be lost, though schema stores it as string, it's fine.
        // mapConfig in input is object, schema expects String? or JSON.
        // Wait, I defined mapConfig as String? in schema.

        await prisma.space.upsert({
            where: { id: s.id }, // Using ID as the unique identifier for upsert if possible, but schema id is UUID usually. 
            // My schema said: id String @id @default(uuid()). 
            // I should set the ID explicitly to match my mock data so existing links dont break if any.
            // Prisma allows setting ID if not auto-increment.

            // Wait, schema: slug String @unique. I added slug.
            // My mock data has 'id' like 'sala', 'verde'. I will use that as the ID for consistency, 
            // OR map them to slug.
            // Let's us use 'id' from mock as the database 'id' to keep it simple, since it's a string.

            update: {
                name: s.name,
                description: s.description,
                dimensions: s.dimensions,
                type: s.type,
                hourlyRate: s.hourlyRate,
                color: s.color,
                mapConfig: s.mapConfig
            },
            create: {
                id: s.id, // Explicitly setting ID
                slug: s.id, // Using same as slug for now
                name: s.name,
                description: s.description,
                dimensions: s.dimensions,
                type: s.type,
                hourlyRate: s.hourlyRate,
                color: s.color,
                mapConfig: s.mapConfig
            }
        })
    }

    console.log('Spaces seeded')
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

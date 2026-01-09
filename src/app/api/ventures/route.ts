import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
    try {
        const ventures = await prisma.venture.findMany({
            include: { products: true },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(ventures);
    } catch (error) {
        return NextResponse.json({ error: 'Error fetching ventures' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            name,
            owner,
            description,
            logoUrl,
            ownerImageUrl,
            whatsapp,
            instagram,
            facebook,
            website,
            email
        } = body;

        const venture = await prisma.venture.create({
            data: {
                name,
                owner,
                description,
                logoUrl,
                ownerImageUrl,
                whatsapp,
                instagram,
                facebook,
                website,
                email
            }
        });

        return NextResponse.json(venture);
    } catch (error) {
        console.error('CREATE_VENTURE_ERROR:', error);
        return NextResponse.json({ error: 'Error creating venture' }, { status: 500 });
    }
}

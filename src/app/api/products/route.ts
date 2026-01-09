import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const ventureId = searchParams.get('ventureId');

    if (!ventureId) {
        return NextResponse.json({ error: 'Venture ID required' }, { status: 400 });
    }

    try {
        const products = await prisma.product.findMany({
            where: { ventureId },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(products);
    } catch (error) {
        return NextResponse.json({ error: 'Error fetching products' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            name,
            description,
            price,
            currency,
            category,
            type,
            size,
            dimensions,
            imageUrl,
            videoUrl,
            ventureId
        } = body;

        const product = await prisma.product.create({
            data: {
                name,
                description,
                price: parseFloat(price) || 0,
                currency: currency || 'CRC',
                category,
                type: type || 'product',
                size,
                dimensions,
                imageUrl,
                videoUrl,
                ventureId
            }
        });

        return NextResponse.json(product);
    } catch (error) {
        console.error('CREATE_PRODUCT_ERROR:', error);
        return NextResponse.json({ error: 'Error creating product' }, { status: 500 });
    }
}

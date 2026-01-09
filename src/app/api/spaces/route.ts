import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
    try {
        const spaces = await prisma.space.findMany();
        // Parse mapConfig from JSON string to object
        const parsedSpaces = spaces.map(s => ({
            ...s,
            mapConfig: s.mapConfig ? JSON.parse(s.mapConfig) : null
        }));
        return NextResponse.json(parsedSpaces);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch spaces' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // If body represents a space
        const { name, description, dimensions, type, hourlyRate, color, mapConfig } = body;

        // Generate slug from name if no ID provided (which is the case for new spaces from frontend)
        let slug = body.id;
        if (!slug && name) {
            slug = name.toLowerCase()
                .trim()
                .replace(/[^\w\s-]/g, '')
                .replace(/[\s_-]+/g, '-')
                .replace(/^-+|-+$/g, '');
            // Append random suffix to ensure uniqueness basic
            slug += `-${Date.now().toString().slice(-4)}`;
        }

        const newSpace = await prisma.space.create({
            data: {
                // If body.id is present, use it for ID (unlikely for new). If not, let Prisma generate UUID.
                // For slug, use the computed slug.
                slug: slug || `space-${Date.now()}`,
                name,
                description,
                dimensions,
                type,
                hourlyRate,
                color,
                mapConfig: JSON.stringify(mapConfig)
            }
        });

        return NextResponse.json(newSpace);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to create space' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, ...data } = body;

        // Handle mapConfig serialization
        const updateData: any = { ...data };
        if (data.mapConfig) {
            updateData.mapConfig = JSON.stringify(data.mapConfig);
        }

        const updated = await prisma.space.update({
            where: { id },
            data: updateData
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to update space' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        await prisma.space.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
    }
}

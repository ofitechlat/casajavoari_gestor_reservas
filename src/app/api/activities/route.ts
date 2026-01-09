import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
    try {
        const activities = await prisma.activity.findMany({
            orderBy: { startDate: 'desc' }
        });
        return NextResponse.json(activities);
    } catch (error) {
        return NextResponse.json({ error: 'Error fetching activities' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { title, description, startDate, endDate, startTime, responsible, imageUrl, videoUrl, instagram, email, tags } = body;

        const activity = await prisma.activity.create({
            data: {
                title,
                description,
                startDate: new Date(startDate),
                endDate: endDate ? new Date(endDate) : null,
                startTime,
                responsible,
                imageUrl,
                videoUrl,
                instagram,
                email,
                tags
            }
        });

        return NextResponse.json(activity);
    } catch (error) {
        console.error('CREATE_ACTIVITY_ERROR:', error);
        return NextResponse.json({ error: 'Error creating activity' }, { status: 500 });
    }
}

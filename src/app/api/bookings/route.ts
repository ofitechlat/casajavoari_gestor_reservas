import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
    try {
        const bookings = await prisma.booking.findMany({
            include: { user: true, space: true } // Include relations if needed
        });
        return NextResponse.json(bookings);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Ensure user exists (in real app, use auth session)
        // Here we trust the userId sent by client for the "connected to db" requirement

        // We need to fetch the User first to ensure relation ? Prisma checks FK constraint.
        // Body likely contains: title, startTime, endTime, status, etc.

        const { title, description, startTime, endTime, status, noiseLevel, needsSilence, exclusive, recurrence, userId, spaceId } = body;

        // Ensure valid date objects
        const start = new Date(startTime);
        const end = new Date(endTime);

        const newBooking = await prisma.booking.create({
            data: {
                title,
                description,
                startTime: start,
                endTime: end,
                status: status || 'pending',
                noiseLevel: noiseLevel || 'moderate',
                needsSilence: needsSilence || false,
                exclusive: exclusive || false,
                recurrence: recurrence ? JSON.stringify(recurrence) : null,

                // Relations
                user: { connect: { id: userId } },
                space: { connect: { slug: spaceId } } // Assuming spaceId from frontend matches DB ID (which we set to slug-like string)
            }
        });

        return NextResponse.json(newBooking);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, title, description, startTime, endTime, status, noiseLevel, needsSilence, exclusive, recurrence, spaceId } = body;

        if (!id) {
            return NextResponse.json({ error: 'ID required' }, { status: 400 });
        }

        const existingBooking = await prisma.booking.findUnique({ where: { id } });
        if (!existingBooking) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }

        // Determine critical changes
        const isTimeChanged = new Date(startTime).getTime() !== new Date(existingBooking.startTime).getTime() ||
            new Date(endTime).getTime() !== new Date(existingBooking.endTime).getTime();
        const isSpaceChanged = spaceId !== existingBooking.spaceId;

        // Status Logic:
        // Force pending if critical info changes, unless explicit status override is provided in this same request
        let newStatus = status;
        if ((isTimeChanged || isSpaceChanged) && !status) {
            newStatus = 'pending';
        }

        const updatedBooking = await prisma.booking.update({
            where: { id },
            data: {
                title,
                description,
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                status: newStatus || existingBooking.status,
                noiseLevel,
                needsSilence,
                exclusive,
                space: spaceId ? { connect: { slug: spaceId } } : undefined,
                recurrence: recurrence ? JSON.stringify(recurrence) : null,
                updatedAt: new Date(),
            }
        });

        return NextResponse.json(updatedBooking);
    } catch (error) {
        console.error("PUT Error:", error);
        return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
    }
}


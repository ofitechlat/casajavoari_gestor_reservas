export type Role = 'gestor' | 'admin';

export interface User {
    id: string;
    name: string;
    email: string;
    role: Role;
    avatarUrl?: string;
}

export type SpaceId = 'sala' | 'verde' | 'planche' | 'multiuso';

export interface Space {
    id: SpaceId;
    name: string;
    description: string;
    capacity?: number;
    dimensions: string; // e.g. "4x12m"
    type: 'indoor' | 'outdoor' | 'semi-outdoor';
    hourlyRate: number; // in local currency units
    color: string; // Tailwind color class for calendar
    image?: string;
    mapConfig: {
        x: number;
        y: number;
        width: number;
        height: number;
        borderRadius?: number;
        rotation?: number;
        path?: string; // For complex shapes
    };
}

export type NoiseLevel = 'silent' | 'moderate' | 'loud';
export type BookingStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface Booking {
    id: string;
    userId: string;
    spaceId: SpaceId;
    title: string;
    description?: string;
    startTime: Date; // ISO string in JSON
    endTime: Date;   // ISO string in JSON
    activityType: string; // e.g., 'dance', 'meeting', 'yoga'
    noiseLevel: NoiseLevel;
    needsSilence: boolean;
    exclusive: boolean; // Does this booking require exclusivity of its space? (Usually yes)
    status: BookingStatus;
    createdAt: Date;
    updatedAt: Date;
    adminNotes?: string;
    totalPrice?: number;
    recurrence?: {
        frequency: 'none' | 'daily' | 'weekly' | 'monthly';
        daysOfWeek?: number[]; // 0=Sun, 1=Mon...
        endDate?: Date;
    };
}

import { Space, User } from "@/types";

export const SPACES: Space[] = [
    {
        id: 'sala',
        slug: 'sala',
        name: 'Sala Principal',
        description: 'Espacio cerrado ideal para talleres, conferencias y reuniones.',
        dimensions: '4x12m',
        type: 'indoor',
        hourlyRate: 15000,
        color: 'bg-blue-500',
        mapConfig: { x: 50, y: 120, width: 120, height: 40, borderRadius: 2 }
    },
    {
        id: 'verde',
        slug: 'verde',
        name: 'Espacio Verde Trasero',
        description: 'Área al aire libre perfecta para actividades recreativas y contacto con la naturaleza.',
        dimensions: 'Variable',
        type: 'outdoor',
        hourlyRate: 10000,
        color: 'bg-green-500',
        mapConfig: { x: 180, y: 80, width: 100, height: 100, borderRadius: 10, path: "M 0 0 Q 100 0 100 100 L 0 100 Z" }
    },
    {
        id: 'planche',
        slug: 'planche',
        name: 'Planché Techado',
        description: 'Espacio amplio techado con iluminación, ideal para danza y ensayos.',
        dimensions: '10x25m',
        type: 'semi-outdoor',
        hourlyRate: 20000,
        color: 'bg-orange-500',
        mapConfig: { x: 50, y: 20, width: 100, height: 90, borderRadius: 2 }
    },
    {
        id: 'multiuso',
        slug: 'multiuso',
        name: 'Sala Multiuso',
        description: 'Espacio flexible para actividades variadas.',
        dimensions: '6x5m',
        type: 'indoor',
        hourlyRate: 12000,
        color: 'bg-purple-500',
        mapConfig: { x: 160, y: 20, width: 60, height: 50, borderRadius: 2 }
    },
];

export const MOCK_USERS: User[] = [
    {
        id: 'u1',
        name: 'Ana Gestora',
        email: 'ana@casajavorai.com',
        role: 'gestor',
        avatarUrl: 'https://avatar.vercel.sh/ana',
    },
    {
        id: 'u2',
        name: 'Carlos Admin',
        email: 'admin@casajavorai.com',
        role: 'admin',
        avatarUrl: 'https://avatar.vercel.sh/carlos',
    },
];

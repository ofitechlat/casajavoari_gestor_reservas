"use client";

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface SpaceMapLabelProps {
    children?: ReactNode;
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    className?: string;
}

export function SpaceMapLabel({
    children = "Mapa de la Casa",
    position = 'bottom-right',
    className
}: SpaceMapLabelProps) {
    const positionClasses = {
        'top-left': 'top-2 left-2',
        'top-right': 'top-2 right-2',
        'bottom-left': 'bottom-2 left-2',
        'bottom-right': 'bottom-2 right-2'
    };

    return (
        <div
            className={cn(
                "absolute text-xs text-muted-foreground bg-background/80 p-1 rounded pointer-events-none",
                positionClasses[position],
                className
            )}
        >
            {children}
        </div>
    );
}

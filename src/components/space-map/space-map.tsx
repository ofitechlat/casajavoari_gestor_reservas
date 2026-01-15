"use client";

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Space, SpaceId } from '@/types';
import { useSpaceMap, UseSpaceMapProps } from './use-space-map';
import { SpaceMapProvider } from './space-map-context';
import { SpaceMapCanvas } from './space-map-canvas';
import { SpaceMapSpaces } from './space-map-spaces';

export interface SpaceMapProps extends Omit<UseSpaceMapProps, 'selectedId'> {
    children?: ReactNode;
    className?: string;
    // Backward compatibility
    selectedSpaceId?: SpaceId | "";
    selectedId?: SpaceId | null;
}

export function SpaceMap({
    spaces,
    selectedId: selectedIdProp,
    selectedSpaceId, // backward compat
    onSelect,
    onSpaceChange,
    editable = false,
    config,
    children,
    className
}: SpaceMapProps) {
    // Support both selectedId and selectedSpaceId for backward compatibility
    const selectedId = selectedIdProp ?? (selectedSpaceId ? selectedSpaceId as SpaceId : null);

    const spaceMap = useSpaceMap({
        spaces,
        selectedId,
        onSelect,
        onSpaceChange,
        editable,
        config
    });

    // If no children provided, use default simple mode
    const content = children || (
        <SpaceMapCanvas>
            <SpaceMapSpaces />
        </SpaceMapCanvas>
    );

    return (
        <SpaceMapProvider value={spaceMap}>
            <div className={cn("relative w-full aspect-4/3 bg-card border rounded-lg p-4 flex items-center justify-center", className)}>
                {content}
            </div>
        </SpaceMapProvider>
    );
}

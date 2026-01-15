"use client";

import { ReactNode } from 'react';
import { Space } from '@/types';
import { useSpaceMapContext } from './space-map-context';
import { SpaceMapSpace } from './space-map-space';

export interface SpaceMapSpacesProps {
    children?: (space: Space) => ReactNode;
    draggable?: boolean;
    resizable?: boolean;
}

export function SpaceMapSpaces({
    children,
    draggable = false,
    resizable = false
}: SpaceMapSpacesProps) {
    const { spaces } = useSpaceMapContext();

    return (
        <>
            {spaces.map((space) => {
                if (children) {
                    return children(space);
                }

                return (
                    <SpaceMapSpace
                        key={space.id}
                        space={space}
                        draggable={draggable}
                        resizable={resizable}
                    />
                );
            })}
        </>
    );
}

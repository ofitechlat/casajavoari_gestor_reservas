"use client";

import { ReactNode } from 'react';
import { useSpaceMapContext } from './space-map-context';

export interface SpaceMapCanvasProps {
    children?: ReactNode;
    viewBox?: string;
    className?: string;
}

export function SpaceMapCanvas({
    children,
    viewBox,
    className = "w-full h-full drop-shadow-sm select-none"
}: SpaceMapCanvasProps) {
    const { svgRef, config, handleMouseMove, handleMouseUp } = useSpaceMapContext();

    return (
        <svg
            ref={svgRef}
            viewBox={viewBox || config.viewBox}
            className={className}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            {/* Background */}
            <rect x="0" y="0" width="300" height="200" fill="none" />
            {children}
        </svg>
    );
}

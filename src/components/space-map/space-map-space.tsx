"use client";

import { MouseEvent } from 'react';
import { cn } from '@/lib/utils';
import { Space } from '@/types';
import { useSpaceMapContext } from './space-map-context';

export interface SpaceMapSpaceProps {
    space: Space;
    draggable?: boolean;
    resizable?: boolean;
}

export function SpaceMapSpace({
    space,
    draggable = false,
    resizable = false
}: SpaceMapSpaceProps) {
    const {
        selectedId,
        editable,
        handleSpaceClick,
        handleDragStart,
        handleResizeStart
    } = useSpaceMapContext();

    let config = space.mapConfig;

    // Parse mapConfig if it's a string
    if (typeof config === 'string') {
        try {
            config = JSON.parse(config);
        } catch (e) {
            console.error("Error parsing mapConfig for space", space.id, e);
            return null;
        }
    }

    if (!config) return null;

    const { x, y, width, height, borderRadius, path } = config;
    const isSelected = selectedId === space.id;
    const isDraggable = editable && draggable;
    const isResizable = editable && resizable && isSelected;

    const getFill = () => {
        if (isSelected) return "fill-primary stroke-primary";
        return "fill-muted hover:fill-primary/20";
    };

    const handleMouseDown = (e: MouseEvent) => {
        if (isDraggable) {
            handleDragStart(space.id, e);
        }
        handleSpaceClick(space.id, e);
    };

    return (
        <g>
            {/* Main shape */}
            <g
                onMouseDown={handleMouseDown}
                className={cn(
                    "transition-transform",
                    isDraggable && "cursor-move hover:scale-[1.01]",
                    !isDraggable && "cursor-pointer"
                )}
            >
                {path ? (
                    <g transform={`translate(${x}, ${y})`}>
                        <path
                            d={path}
                            className={cn("stroke-border stroke-2 transition-colors", getFill())}
                        />
                    </g>
                ) : (
                    <rect
                        x={x}
                        y={y}
                        width={width}
                        height={height}
                        rx={borderRadius || 0}
                        className={cn("stroke-border stroke-2 transition-colors", getFill())}
                    />
                )}

                {/* Label */}
                <text
                    x={x + width / 2}
                    y={y + height / 2 + 4}
                    fontSize="10"
                    textAnchor="middle"
                    className="fill-foreground pointer-events-none font-bold"
                    style={{ textShadow: "0px 0px 2px rgba(255,255,255,0.8)" }}
                >
                    {space.name}
                </text>
            </g>

            {/* Resize handles */}
            {isResizable && !path && (
                <>
                    {/* Top-left */}
                    <circle
                        cx={x}
                        cy={y}
                        r={4}
                        className="fill-primary stroke-background stroke-2 cursor-nw-resize"
                        onMouseDown={(e) => handleResizeStart(space.id, 'nw', e)}
                    />
                    {/* Top-right */}
                    <circle
                        cx={x + width}
                        cy={y}
                        r={4}
                        className="fill-primary stroke-background stroke-2 cursor-ne-resize"
                        onMouseDown={(e) => handleResizeStart(space.id, 'ne', e)}
                    />
                    {/* Bottom-left */}
                    <circle
                        cx={x}
                        cy={y + height}
                        r={4}
                        className="fill-primary stroke-background stroke-2 cursor-sw-resize"
                        onMouseDown={(e) => handleResizeStart(space.id, 'sw', e)}
                    />
                    {/* Bottom-right */}
                    <circle
                        cx={x + width}
                        cy={y + height}
                        r={4}
                        className="fill-primary stroke-background stroke-2 cursor-se-resize"
                        onMouseDown={(e) => handleResizeStart(space.id, 'se', e)}
                    />
                </>
            )}
        </g>
    );
}

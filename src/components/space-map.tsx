"use client";

import { cn } from "@/lib/utils";
import { Space, SpaceId } from "@/types";
import { SPACES as MOCK_SPACES } from "@/data/mock";

interface SpaceMapProps {
    selectedSpaceId?: SpaceId | "";
    onSelect?: (id: SpaceId) => void;
    className?: string;
    spaces?: Space[]; // Allow passing custom spaces (e.g. from editor)
}

export function SpaceMap({ selectedSpaceId, onSelect, className, spaces = MOCK_SPACES }: SpaceMapProps) {

    const getFill = (id: SpaceId) => {
        if (selectedSpaceId === id) return "fill-primary stroke-primary border-2"; // Highlight
        return "fill-muted hover:fill-primary/20 cursor-pointer";
    };

    return (
        <div className={cn("relative w-full aspect-[4/3] bg-card border rounded-lg p-4 flex items-center justify-center", className)}>
            <svg viewBox="0 0 300 200" className="w-full h-full drop-shadow-sm select-none">
                {/* Background / Plot */}
                <rect x="0" y="0" width="300" height="200" fill="none" />

                {spaces.map((space) => {
                    const { x, y, width, height, borderRadius, path } = space.mapConfig;

                    return (
                        <g key={space.id} onClick={() => onSelect?.(space.id)} className="transition-transform hover:scale-[1.01]">
                            {path ? (
                                <g transform={`translate(${x}, ${y})`}>
                                    <path d={path} className={cn("stroke-border stroke-2 transition-colors", getFill(space.id))} />
                                </g>
                            ) : (
                                <rect
                                    x={x}
                                    y={y}
                                    width={width}
                                    height={height}
                                    rx={borderRadius || 0}
                                    className={cn("stroke-border stroke-2 transition-colors", getFill(space.id))}
                                />
                            )}

                            {/* Label centered in the rect */}
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
                    );
                })}
            </svg>
            <div className="absolute bottom-2 right-2 text-xs text-muted-foreground bg-background/80 p-1 rounded pointer-events-none">
                Mapa de la Casa
            </div>
        </div>
    );
}

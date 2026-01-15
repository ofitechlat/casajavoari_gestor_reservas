"use client";

export interface SpaceMapGridProps {
    gridSize?: number;
    strokeWidth?: number;
    className?: string;
}

export function SpaceMapGrid({
    gridSize = 10,
    strokeWidth = 0.5,
    className = "stroke-muted-foreground/20"
}: SpaceMapGridProps) {
    const lines = [];

    // Vertical lines
    for (let x = 0; x <= 300; x += gridSize) {
        lines.push(
            <line
                key={`v-${x}`}
                x1={x}
                y1={0}
                x2={x}
                y2={200}
                strokeWidth={strokeWidth}
                className={className}
            />
        );
    }

    // Horizontal lines
    for (let y = 0; y <= 200; y += gridSize) {
        lines.push(
            <line
                key={`h-${y}`}
                x1={0}
                y1={y}
                x2={300}
                y2={y}
                strokeWidth={strokeWidth}
                className={className}
            />
        );
    }

    return <g className="pointer-events-none">{lines}</g>;
}

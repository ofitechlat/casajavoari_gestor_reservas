import { useState, useCallback, useRef, MouseEvent } from 'react';
import { Space, SpaceId } from '@/types';

export interface SpaceMapConfig {
    viewBox: string;
    width?: number;
    height?: number;
}

export interface UseSpaceMapProps {
    spaces: Space[];
    selectedId?: SpaceId | null;
    onSelect?: (id: SpaceId) => void;
    onSpaceChange?: (id: SpaceId, updates: Partial<Space['mapConfig']>) => void;
    editable?: boolean;
    config?: SpaceMapConfig;
}

export interface DragState {
    isDragging: boolean;
    spaceId: SpaceId | null;
    startX: number;
    startY: number;
    offsetX: number;
    offsetY: number;
}

export interface ResizeState {
    isResizing: boolean;
    spaceId: SpaceId | null;
    handle: 'nw' | 'ne' | 'sw' | 'se' | null;
    startX: number;
    startY: number;
    originalWidth: number;
    originalHeight: number;
    originalX: number;
    originalY: number;
}

export function useSpaceMap({
    spaces,
    selectedId,
    onSelect,
    onSpaceChange,
    editable = false,
    config = { viewBox: '0 0 300 200' }
}: UseSpaceMapProps) {
    const svgRef = useRef<SVGSVGElement>(null);
    const [dragState, setDragState] = useState<DragState>({
        isDragging: false,
        spaceId: null,
        startX: 0,
        startY: 0,
        offsetX: 0,
        offsetY: 0
    });

    const [resizeState, setResizeState] = useState<ResizeState>({
        isResizing: false,
        spaceId: null,
        handle: null,
        startX: 0,
        startY: 0,
        originalWidth: 0,
        originalHeight: 0,
        originalX: 0,
        originalY: 0
    });

    // Convert screen coordinates to SVG coordinates
    const screenToSVG = useCallback((clientX: number, clientY: number) => {
        if (!svgRef.current) return { x: 0, y: 0 };

        const svg = svgRef.current;
        const pt = svg.createSVGPoint();
        pt.x = clientX;
        pt.y = clientY;

        const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse());
        return { x: svgP.x, y: svgP.y };
    }, []);

    // Handle space selection
    const handleSpaceClick = useCallback((spaceId: SpaceId, e: MouseEvent) => {
        e.stopPropagation();
        onSelect?.(spaceId);
    }, [onSelect]);

    // Start dragging a space
    const handleDragStart = useCallback((spaceId: SpaceId, e: MouseEvent) => {
        if (!editable) return;

        e.stopPropagation();
        const space = spaces.find(s => s.id === spaceId);
        if (!space?.mapConfig) return;

        const { x, y } = screenToSVG(e.clientX, e.clientY);

        setDragState({
            isDragging: true,
            spaceId,
            startX: x,
            startY: y,
            offsetX: x - space.mapConfig.x,
            offsetY: y - space.mapConfig.y
        });
    }, [editable, spaces, screenToSVG]);

    // Handle mouse move for dragging
    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (dragState.isDragging && dragState.spaceId) {
            const { x, y } = screenToSVG(e.clientX, e.clientY);
            const newX = x - dragState.offsetX;
            const newY = y - dragState.offsetY;

            onSpaceChange?.(dragState.spaceId, {
                x: Math.round(newX),
                y: Math.round(newY)
            });
        }

        if (resizeState.isResizing && resizeState.spaceId) {
            const { x, y } = screenToSVG(e.clientX, e.clientY);
            const deltaX = x - resizeState.startX;
            const deltaY = y - resizeState.startY;

            let updates: Partial<Space['mapConfig']> = {};

            switch (resizeState.handle) {
                case 'se': // Bottom-right
                    updates = {
                        width: Math.max(10, resizeState.originalWidth + deltaX),
                        height: Math.max(10, resizeState.originalHeight + deltaY)
                    };
                    break;
                case 'sw': // Bottom-left
                    updates = {
                        x: resizeState.originalX + deltaX,
                        width: Math.max(10, resizeState.originalWidth - deltaX),
                        height: Math.max(10, resizeState.originalHeight + deltaY)
                    };
                    break;
                case 'ne': // Top-right
                    updates = {
                        y: resizeState.originalY + deltaY,
                        width: Math.max(10, resizeState.originalWidth + deltaX),
                        height: Math.max(10, resizeState.originalHeight - deltaY)
                    };
                    break;
                case 'nw': // Top-left
                    updates = {
                        x: resizeState.originalX + deltaX,
                        y: resizeState.originalY + deltaY,
                        width: Math.max(10, resizeState.originalWidth - deltaX),
                        height: Math.max(10, resizeState.originalHeight - deltaY)
                    };
                    break;
            }

            onSpaceChange?.(resizeState.spaceId, updates);
        }
    }, [dragState, resizeState, screenToSVG, onSpaceChange]);

    // Handle mouse up to end dragging/resizing
    const handleMouseUp = useCallback(() => {
        setDragState({
            isDragging: false,
            spaceId: null,
            startX: 0,
            startY: 0,
            offsetX: 0,
            offsetY: 0
        });

        setResizeState({
            isResizing: false,
            spaceId: null,
            handle: null,
            startX: 0,
            startY: 0,
            originalWidth: 0,
            originalHeight: 0,
            originalX: 0,
            originalY: 0
        });
    }, []);

    // Start resizing a space
    const handleResizeStart = useCallback((
        spaceId: SpaceId,
        handle: 'nw' | 'ne' | 'sw' | 'se',
        e: MouseEvent
    ) => {
        if (!editable) return;

        e.stopPropagation();
        const space = spaces.find(s => s.id === spaceId);
        if (!space?.mapConfig) return;

        const { x, y } = screenToSVG(e.clientX, e.clientY);

        setResizeState({
            isResizing: true,
            spaceId,
            handle,
            startX: x,
            startY: y,
            originalWidth: space.mapConfig.width,
            originalHeight: space.mapConfig.height,
            originalX: space.mapConfig.x,
            originalY: space.mapConfig.y
        });
    }, [editable, spaces, screenToSVG]);

    return {
        svgRef,
        config,
        spaces,
        selectedId,
        editable,
        dragState,
        resizeState,
        handleSpaceClick,
        handleDragStart,
        handleMouseMove,
        handleMouseUp,
        handleResizeStart
    };
}

export type UseSpaceMapReturn = ReturnType<typeof useSpaceMap>;

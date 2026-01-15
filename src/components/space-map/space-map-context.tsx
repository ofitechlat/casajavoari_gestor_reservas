"use client";

import { createContext, useContext, ReactNode } from 'react';
import { UseSpaceMapReturn } from './use-space-map';

const SpaceMapContext = createContext<UseSpaceMapReturn | null>(null);

export interface SpaceMapProviderProps {
    value: UseSpaceMapReturn;
    children: ReactNode;
}

export function SpaceMapProvider({ value, children }: SpaceMapProviderProps) {
    return (
        <SpaceMapContext.Provider value={value}>
            {children}
        </SpaceMapContext.Provider>
    );
}

export function useSpaceMapContext() {
    const context = useContext(SpaceMapContext);
    if (!context) {
        throw new Error('useSpaceMapContext must be used within SpaceMapProvider');
    }
    return context;
}

"use client";

import * as React from "react";
import { Space, SpaceId } from "@/types";
import { cn } from "@/lib/utils";

type SpaceMapContextValue = {
  selectedId?: SpaceId;
  select: (id: SpaceId) => void;
};

const SpaceMapContext = React.createContext<SpaceMapContextValue | null>(null);

export function useSpaceMap() {
  const ctx = React.useContext(SpaceMapContext);
  if (!ctx) {
    throw new Error("useSpaceMap must be used inside <SpaceMap>");
  }
  return ctx;
}

interface SpaceMapProps {
  value?: SpaceId;
  defaultValue?: SpaceId;
  onValueChange?: (id: SpaceId) => void;
  children: React.ReactNode;
}

export function SpaceMap({
  value,
  defaultValue,
  onValueChange,
  children,
}: SpaceMapProps) {
  const [internal, setInternal] = React.useState(defaultValue);
  const selectedId = value ?? internal;

  const select = (id: SpaceId) => {
    setInternal(id);
    onValueChange?.(id);
  };

  return (
    <SpaceMapContext.Provider value={{ selectedId, select }}>
      {children}
    </SpaceMapContext.Provider>
  );
}



interface SpaceMapSvgProps extends React.SVGAttributes<SVGSVGElement> { }

export function SpaceMapSvg({ className, ...props }: SpaceMapSvgProps) {
  return (
    <svg
      viewBox="0 0 300 200"
      className={cn("w-full h-full select-none", className)}
      {...props}
    />
  );
}

interface SpaceMapSpaceProps {
  space: Space;
  children?: (state: {
    selected: boolean;
    select: () => void;
  }) => React.ReactNode;
}

export function SpaceMapSpace({ space, children }: SpaceMapSpaceProps) {
  const { selectedId, select } = useSpaceMap();
  const selected = selectedId === space.id;

  let config = space.mapConfig;
  if (typeof config === "string") {
    config = JSON.parse(config);
  }

  if (!config) return null;

  const { x, y, width, height, borderRadius, path } = config;

  return (
    <g
      onClick={() => select(space.id)}
      className={cn(
        "cursor-pointer transition-colors",
        selected ? "fill-primary stroke-primary" : "fill-muted"
      )}
    >
      {path ? (
        <g transform={`translate(${x}, ${y})`}>
          <path d={path} className="stroke-2 stroke-border" />
        </g>
      ) : (
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          rx={borderRadius ?? 0}
          className="stroke-2 stroke-border"
        />
      )}

      {/* SLOT REAL */}
      {children?.({
        selected,
        select: () => select(space.id),
      })}
    </g>
  );
}





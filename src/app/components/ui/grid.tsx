'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  columns?: number;
  gap?: number | string;
  rowGap?: number | string;
  columnGap?: number | string;
  flow?: 'row' | 'column' | 'dense' | 'row dense' | 'column dense';
}

interface GridItemProps extends React.HTMLAttributes<HTMLDivElement> {
  span?: number;
  start?: number;
  end?: number;
  rowSpan?: number;
  rowStart?: number;
  rowEnd?: number;
}

export const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  ({ 
    className, 
    children, 
    columns = 12, 
    gap, 
    rowGap, 
    columnGap, 
    flow,
    ...props 
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'grid',
          className
        )}
        style={{
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          gap: gap,
          rowGap: rowGap,
          columnGap: columnGap,
          gridAutoFlow: flow,
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Grid.displayName = 'Grid';

export const GridItem = React.forwardRef<HTMLDivElement, GridItemProps>(
  ({ 
    className, 
    children, 
    span, 
    start, 
    end, 
    rowSpan, 
    rowStart, 
    rowEnd,
    ...props 
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(className)}
        style={{
          gridColumn: span ? `span ${span} / span ${span}` : start && end ? `${start} / ${end}` : start ? `${start} / auto` : end ? `auto / ${end}` : undefined,
          gridRow: rowSpan ? `span ${rowSpan} / span ${rowSpan}` : rowStart && rowEnd ? `${rowStart} / ${rowEnd}` : rowStart ? `${rowStart} / auto` : rowEnd ? `auto / ${rowEnd}` : undefined,
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GridItem.displayName = 'GridItem'; 
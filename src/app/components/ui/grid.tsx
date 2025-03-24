'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  columns?: number;
  gap?: number | string;
}

export const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  ({ 
    className, 
    children, 
    columns = 12, 
    gap = 4,
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
          gap: typeof gap === 'number' ? `${gap * 0.25}rem` : gap,
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Grid.displayName = 'Grid';

interface GridItemProps extends React.HTMLAttributes<HTMLDivElement> {
  span?: number;
}

export const GridItem = React.forwardRef<HTMLDivElement, GridItemProps>(
  ({ 
    className, 
    children, 
    span = 1, 
    ...props 
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(className)}
        style={{
          gridColumn: `span ${span} / span ${span}`,
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GridItem.displayName = 'GridItem'; 
import { cn } from '../../lib/utils';
import React from 'react';

const Card = React.forwardRef(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "rounded-2xl border bg-card text-card-foreground shadow-soft",
            className
        )}
        {...props}
    />
));
Card.displayName = "Card";

export { Card };

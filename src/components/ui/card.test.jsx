import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Card } from './card';
import React from 'react';

describe('Card Component', () => {
    it('renders children correctly', () => {
        render(
            <Card>
                <div data-testid="child">Hello World</div>
            </Card>
        );
        
        expect(screen.getByTestId('child')).toBeInTheDocument();
        expect(screen.getByText('Hello World')).toBeInTheDocument();
    });

    it('applies custom className', () => {
        const { container } = render(<Card className="custom-class" />);
        expect(container.firstChild).toHaveClass('custom-class');
    });
});

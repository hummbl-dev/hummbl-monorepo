import React from 'react';
import { render, screen } from '@testing-library/react';
import { Wing } from '../Wing';

describe('Wing Component', () => {
  it('renders with default props', () => {
    render(<Wing transformation="P" />);
    const img = screen.getByRole('img', { name: /perceive wing/i });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/assets/wings/wing-p.svg');
    expect(img).toHaveClass('wing-image');
  });

  it('applies custom size class', () => {
    render(<Wing transformation="P" size="large" />);
    const container = screen.getByRole('img', { name: /perceive wing/i }).closest('div');
    expect(container).toHaveClass('wing-size-large');
  });

  it('applies animation class when animate is hover', () => {
    render(<Wing transformation="P" animate="hover" />);
    const container = screen.getByRole('img', { name: /perceive wing/i }).closest('div');
    expect(container).toHaveClass('wing-animate-hover');
  });

  it('applies custom className', () => {
    render(<Wing transformation="P" className="custom-class" />);
    const container = screen.getByRole('img', { name: /perceive wing/i }).closest('div');
    expect(container).toHaveClass('custom-class');
  });
});

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { WingSelector } from '../WingSelector';
import { Transformation } from '../Wing';

describe('WingSelector', () => {
  const transformations: Transformation[] = ['P', 'IN', 'CO', 'DE', 'RE', 'SY'];
  const mockOnSelect = vi.fn();
  
  it('renders all transformation options', () => {
    render(<WingSelector onSelect={mockOnSelect} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(transformations.length);
  });

  it('calls onSelect with the correct transformation when a wing is clicked', () => {
    render(<WingSelector onSelect={mockOnSelect} />);
    const button = screen.getByRole('button', { name: /perceive/i });
    fireEvent.click(button);
    expect(mockOnSelect).toHaveBeenCalledWith('P');
  });

  it('applies active state to the selected wing', () => {
    render(<WingSelector onSelect={mockOnSelect} defaultSelected="P" />);
    const button = screen.getByRole('button', { name: /perceive/i });
    const radio = button.closest('[role="radio"]');
    expect(radio).toHaveAttribute('aria-checked', 'true');
  });

  it('shows labels when showLabels is true', () => {
    render(<WingSelector onSelect={mockOnSelect} showLabels={true} />);
    const labels = screen.getAllByText('P');
    expect(labels.length).toBeGreaterThan(0);
    const inLabels = screen.getAllByText('IN');
    expect(inLabels.length).toBeGreaterThan(0);
  });

  it('applies custom className', () => {
    const customClass = 'custom-selector';
    const { container } = render(
      <WingSelector onSelect={mockOnSelect} className={customClass} />
    );
    expect(container.firstChild).toHaveClass(customClass);
  });

  it('renders with default props', () => {
    render(<WingSelector onSelect={mockOnSelect} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(6); // 6 transformations by default
  });
});

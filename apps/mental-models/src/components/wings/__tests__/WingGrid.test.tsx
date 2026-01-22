import { render, screen } from '@testing-library/react';
import { WingGrid } from '../WingGrid';
import { Transformation } from '../Wing';

describe('WingGrid', () => {
  const transformations: Transformation[] = ['P', 'IN', 'CO', 'DE', 'RE', 'SY'];
  
  it('renders all provided wing transformations', () => {
    render(<WingGrid transformations={transformations} />);
    const wings = screen.getAllByRole('img', { hidden: true });
    expect(wings).toHaveLength(transformations.length);
  });

  it('applies custom grid template columns', () => {
    const columns = 3;
    const { container } = render(
      <WingGrid transformations={transformations} columns={columns} />
    );
    const grid = container.firstChild;
    expect(grid).toHaveStyle(`grid-template-columns: repeat(${columns}, 1fr)`);
  });

  it('applies animation class when animate is true', () => {
    render(<WingGrid transformations={transformations} animate="hover" />);
    const wings = screen.getAllByRole('img', { hidden: true });
    wings.forEach(wing => {
      expect(wing.closest('div')).toHaveClass('wing-animate-hover');
    });
  });

  it('applies custom className to the grid container', () => {
    const customClass = 'custom-grid';
    const { container } = render(
      <WingGrid transformations={transformations} className={customClass} />
    );
    expect(container.firstChild).toHaveClass(customClass);
  });

  it('renders with default props', () => {
    const { container } = render(<WingGrid transformations={transformations} />);
    expect(container.firstChild).toHaveStyle('grid-template-columns: repeat(3, 1fr)');
    expect(container.firstChild).toHaveClass('wing-grid');
  });
});

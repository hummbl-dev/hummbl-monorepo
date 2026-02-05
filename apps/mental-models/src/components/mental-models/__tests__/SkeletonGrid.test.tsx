/// <reference types="vitest" />
/// <reference types="@testing-library/jest-dom" />

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SkeletonGrid from '../SkeletonGrid';

describe('SkeletonGrid', () => {
  it('renders default number of skeletons', () => {
    render(<SkeletonGrid isLoading={true} />);
    const skeletons = screen.getAllByTestId('skeleton-card');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders custom number of skeletons', () => {
    render(<SkeletonGrid isLoading={true} count={3} />);
    const skeletons = screen.getAllByTestId('skeleton-card');
    expect(skeletons).toHaveLength(3);
  });

  it('renders nothing when not loading', () => {
    const { container } = render(<SkeletonGrid isLoading={false} />);
    expect(container.firstChild).toBeNull();
  });
});

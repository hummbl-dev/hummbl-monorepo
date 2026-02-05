/// <reference types="vitest" />
/// <reference types="@testing-library/jest-dom" />

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ModelCard from '../ModelCard';
import type { MentalModel } from '@cascade/types/mental-model';
import type { TransformationKey } from '@cascade/types/transformation';

const mockModel: MentalModel = {
  id: '1',
  name: 'First Principles',
  code: 'FP',
  description: 'Breaking down problems into basics',
  example: 'Start from foundational truths',
  category: 'Problem Solving',
  tags: ['thinking'],
  transformations: ['P'] as TransformationKey[],
  sources: [{ name: 'Aristotle', reference: 'Metaphysics' }],
  meta: { added: '2025-01-01', updated: '2025-01-01', isCore: true, difficulty: 3 },
};

describe('ModelCard', () => {
  it('renders full model info', () => {
    render(<ModelCard model={mockModel} onSelect={() => {}} />);
    expect(screen.getByText('First Principles')).toBeInTheDocument();
    expect(screen.getByText('FP')).toBeInTheDocument();
    expect(screen.getByText(/Breaking down problems/i)).toBeInTheDocument();
    expect(screen.getByText(/Start from foundational truths/i)).toBeInTheDocument();
    expect(screen.getByText('1 source')).toBeInTheDocument();
  });

  it('calls onSelect when clicked', async () => {
    const onSelect = vi.fn();
    render(<ModelCard model={mockModel} onSelect={onSelect} />);
    await userEvent.click(screen.getByText('First Principles'));
    expect(onSelect).toHaveBeenCalledWith(mockModel);
  });

  it('renders gracefully with minimal required fields', () => {
    const minimal: MentalModel = {
      id: mockModel.id,
      name: mockModel.name,
      code: mockModel.code,
      description: mockModel.description,
      category: mockModel.category,
      tags: [],
      transformations: ['P'] as TransformationKey[],
      sources: [],
      meta: { isCore: true, difficulty: 3 },
    };
    render(<ModelCard model={minimal} onSelect={() => {}} />);
    expect(screen.getByText('First Principles')).toBeInTheDocument();
  });
});

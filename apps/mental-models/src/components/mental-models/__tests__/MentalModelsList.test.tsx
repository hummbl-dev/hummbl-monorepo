/// <reference types="vitest" />
/// <reference types="@testing-library/jest-dom" />

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MentalModelsList from '../MentalModelsList';
import type { MentalModel } from '@cascade/types/mental-model';
import type { TransformationKey } from '@cascade/types/transformation';

// Mock the mental models data
const mockModels: MentalModel[] = [
  {
    id: '1',
    name: 'First Principles',
    code: 'FP',
    description: 'Breaking down complex problems into basic elements',
    category: 'Problem Solving',
    tags: ['thinking', 'problem-solving'],
    transformations: ['P'] as TransformationKey[],
    sources: [{ name: 'Aristotle', reference: 'Metaphysics' }],
    meta: {
      added: '2025-01-01',
      updated: '2025-01-01',
      isCore: true,
      difficulty: 3,
    },
  },
  {
    id: '2',
    name: 'Second-Order Thinking',
    code: 'SOT',
    description: 'Consider second-level effects of decisions',
    category: 'Decision Making',
    tags: ['strategy', 'systems'],
    transformations: ['IN', 'RE', 'SY'] as TransformationKey[],
    sources: [{ name: 'Howard Marks', reference: 'The Most Important Thing' }],
    meta: {
      added: '2024-05-01',
      updated: '2025-01-01',
      isCore: false,
      difficulty: 4,
    },
  },
];

describe('MentalModelsList', () => {
  const mockOnSelect = vi.fn();
  const mockOnRetry = vi.fn();

  it('renders loading state', () => {
    render(<MentalModelsList isLoading={true} onSelect={mockOnSelect} />);

    expect(screen.getByTestId('skeleton-grid')).toBeInTheDocument();
  });

  it('renders error state', () => {
    render(
      <MentalModelsList
        error="Failed to load models"
        onSelect={mockOnSelect}
        onRetry={mockOnRetry}
      />
    );

    expect(screen.getByText('Failed to load models')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('renders empty state when no models are available', () => {
    render(<MentalModelsList models={[]} onSelect={mockOnSelect} />);

    expect(screen.getByText('No models found')).toBeInTheDocument();
  });

  it('renders list of models', () => {
    render(<MentalModelsList models={mockModels} onSelect={mockOnSelect} />);

    expect(screen.getByText('First Principles')).toBeInTheDocument();
    expect(screen.getByText('Second-Order Thinking')).toBeInTheDocument();
  });

  it('calls onSelect when a model is clicked', async () => {
    render(<MentalModelsList models={mockModels} onSelect={mockOnSelect} />);

    await userEvent.click(screen.getByText('First Principles'));
    expect(mockOnSelect).toHaveBeenCalledWith(mockModels[0]);
  });

  it('calls onRetry when retry button is clicked', async () => {
    render(
      <MentalModelsList error="Failed to load" onSelect={mockOnSelect} onRetry={mockOnRetry} />
    );

    await userEvent.click(screen.getByRole('button', { name: /retry/i }));
    expect(mockOnRetry).toHaveBeenCalled();
  });
});

import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { MentalModelsList } from './MentalModelsList';
import { mockModels } from './__tests__/MentalModelsList.test';

const meta: Meta<typeof MentalModelsList> = {
  title: 'Components/MentalModelsList',
  component: MentalModelsList,
  parameters: {
    layout: 'fullscreen',
    // Enable Chromatic for visual regression testing
    chromatic: {
      disableSnapshot: false,
      viewports: [320, 768, 1200],
    },
  },
};

export default meta;

type Story = StoryObj<typeof MentalModelsList>;

// Mock the useMentalModels hook
jest.mock('../../services/mentalModelsService', () => ({
  useMentalModels: () => ({
    models: mockModels,
    isLoading: false,
    error: null,
    refetch: () => {},
  }),
}));

export const Default: Story = {};

export const Loading: Story = {
  parameters: {
    chromatic: { disableSnapshot: true },
  },
  decorators: [
    (Story) => {
      jest
        .mocked(require('../../services/mentalModelsService').useMentalModels)
        .mockReturnValueOnce({
          models: [],
          isLoading: true,
          error: null,
          refetch: () => {},
        });
      return <Story />;
    },
  ],
};

export const ErrorState: Story = {
  parameters: {
    chromatic: { disableSnapshot: true },
  },
  decorators: [
    (Story) => {
      jest
        .mocked(require('../../services/mentalModelsService').useMentalModels)
        .mockReturnValueOnce({
          models: [],
          isLoading: false,
          error: new Error('Failed to load models'),
          refetch: () => {},
        });
      return <Story />;
    },
  ],
};

export const EmptyState: Story = {
  decorators: [
    (Story) => {
      jest
        .mocked(require('../../services/mentalModelsService').useMentalModels)
        .mockReturnValueOnce({
          models: [],
          isLoading: false,
          error: null,
          refetch: () => {},
        });
      return <Story />;
    },
  ],
};

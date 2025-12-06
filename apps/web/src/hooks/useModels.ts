import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  getAllModels,
  TRANSFORMATIONS,
  type MentalModel,
  type TransformationType,
} from '@hummbl/core';

interface ApiSuccess {
  ok: true;
  value: {
    models: MentalModel[];
    count: number;
    transformation: TransformationType | null;
    search: string | null;
  };
}

interface ApiFailure {
  ok: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

type ApiResponse = ApiSuccess | ApiFailure;

type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export interface Base120Model extends MentalModel {
  id: string;
  transformation_name: string;
  transformation_code: string;
  base_level: number;
  system_prompt: string;
  tags: string[];
  difficulty: DifficultyLevel;
  updatedAt?: string;
}

const API_BASE = import.meta.env.VITE_API_BASE ?? '/api';

const deriveTags = (model: MentalModel): string[] => {
  const corpus = `${model.name} ${model.definition} ${model.whenToUse ?? ''}`.toLowerCase();
  const tokens = corpus.split(/[^a-z0-9]+/).filter(token => token.length > 4);
  const unique = Array.from(new Set(tokens));
  return unique.slice(0, 4);
};

const coerceDifficulty = (model: MentalModel): DifficultyLevel => {
  const candidate = (model as { difficulty?: DifficultyLevel }).difficulty;
  if (candidate === 'beginner' || candidate === 'intermediate' || candidate === 'advanced') {
    return candidate;
  }

  if (model.priority >= 4) return 'advanced';
  if (model.priority >= 2) return 'intermediate';
  return 'beginner';
};

const normalizeModel = (model: MentalModel): Base120Model => {
  const transformationMeta = TRANSFORMATIONS[model.transformation];
  return {
    ...model,
    id: model.code,
    transformation_name: transformationMeta?.name ?? model.transformation,
    transformation_code: transformationMeta?.code ?? model.transformation,
    base_level: model.priority,
    system_prompt: model.definition,
    tags: deriveTags(model),
    difficulty: coerceDifficulty(model),
    updatedAt: (model as { updatedAt?: string }).updatedAt,
  };
};

const fetchModelsFromApi = async (): Promise<Base120Model[]> => {
  const response = await fetch(`${API_BASE}/v1/models`);
  if (!response.ok) {
    throw new Error('Failed to load models from API');
  }

  const payload = (await response.json()) as ApiResponse;
  if (!payload.ok) {
    throw new Error(payload.error.message);
  }

  return payload.value.models.map(normalizeModel);
};

export const useModels = () => {
  const fallbackModels = useMemo(() => getAllModels().map(normalizeModel), []);

  const query = useQuery<Base120Model[]>({
    queryKey: ['models'],
    queryFn: fetchModelsFromApi,
    initialData: fallbackModels,
  });

  return {
    models: query.data ?? fallbackModels,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error instanceof Error ? query.error.message : null,
    lastUpdated: query.dataUpdatedAt || null,
    source: query.dataUpdatedAt ? 'api' : 'local',
    refetch: query.refetch,
  };
};

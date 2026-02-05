export interface MentalModel {
  id: string;
  name: string;
  code: string;
  description: string;
  definition?: string;
  category: string;
  tags: string[];
  transformation?: string;
  complexity?: string;
  relationships?: {
    type: string;
    target: string;
    description: string;
  }[];
  methods?: {
    method: string;
    description: string;
    duration: string;
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  }[];
  examples?: string[];
  citations?: {
    author: string;
    year: number;
    title: string;
    source: string;
  }[];
  domain?: string[];
  lastUpdated?: string;
  version?: string;
}

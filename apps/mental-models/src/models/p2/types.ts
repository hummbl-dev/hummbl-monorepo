export type StakeholderType = 
  | 'customer' 
  | 'supplier' 
  | 'regulator' 
  | 'competitor' 
  | 'internal' 
  | 'investor' 
  | 'partner' 
  | 'community' 
  | 'other';

export interface Stakeholder {
  id: string;
  name: string;
  type: StakeholderType;
  influence: number; // 1-5 scale
  interest: number;  // 1-5 scale
  impact?: number;   // Optional: 1-5 scale
  description?: string;
  relationships?: {
    stakeholderId: string;
    relationshipType: 'supports' | 'opposes' | 'influences' | 'depends_on' | 'competes_with';
    strength: number; // 1-5 scale
  }[];
}

export interface StakeholderMap {
  id: string;
  name: string;
  description: string;
  stakeholders: Stakeholder[];
  createdAt: Date;
  updatedAt: Date;
}

export interface StakeholderAnalysis {
  keyStakeholders: Stakeholder[];       // High influence, high interest
  keepSatisfied: Stakeholder[];         // High influence, low interest
  keepInformed: Stakeholder[];          // Low influence, high interest
  minimalEffort: Stakeholder[];         // Low influence, low interest
  networkMap: {
    nodes: Array<{id: string; label: string; type: StakeholderType}>;
    edges: Array<{from: string; to: string; label: string; strength: number}>;
  };
}

export interface StakeholderModel {
  id: string;
  name: string;
  description: string;
  transformation: string;
  tier: number;
  keyCharacteristics: string[];
  relatedModels: string[];
  example: {
    scenario: string;
    stakeholders: Stakeholder[];
  };
  methods: {
    createStakeholder: (params: Omit<Stakeholder, 'id'>) => Stakeholder;
    createStakeholderMap: (name: string, description?: string) => StakeholderMap;
    analyzeStakeholders: (stakeholders: Stakeholder[]) => StakeholderAnalysis;
    generateNetworkMap: (stakeholders: Stakeholder[]) => StakeholderAnalysis['networkMap'];
    findInfluencers: (stakeholders: Stakeholder[], minInfluence?: number) => Stakeholder[];
    findKeyStakeholders: (stakeholders: Stakeholder[]) => Stakeholder[];
  };
}
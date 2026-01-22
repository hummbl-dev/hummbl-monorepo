export interface BetaApplication {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  linkedinProfile?: string;
  githubProfile?: string;

  // Professional Background
  currentRole: string;
  industry: string;
  yearsExperience: number;
  primaryLanguages: string[];
  frameworks: string[];

  // Problem Solving Context
  problemTypes: string[];
  currentFrameworks: string[];
  painPoints: string;

  // HUMMBL Interest
  discoverySource: string;
  useCases: string[];
  expectedOutcomes: string;

  // Technical Requirements
  developmentEnvironment: 'local' | 'cloud' | 'hybrid';
  integrationNeeds: ('api' | 'sdk' | 'ui')[];
  performanceExpectations: string;

  // Commitment
  weeklyHours: number;
  feedbackFrequency: 'daily' | 'weekly' | 'biweekly';
  participationDuration: number; // months

  // Demographics
  location: string;
  companySize?: string;
  teamSize?: string;

  // Meta
  submittedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
}

export interface BetaApplicationForm extends Omit<BetaApplication, 'submittedAt' | 'status'> {
  agreeToTerms: boolean;
}
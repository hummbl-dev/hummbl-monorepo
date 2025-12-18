/**
 * AWSServices Authoritative Definitions
 * 
 * Single source of truth for all awsservices concepts
 */

export interface AWSServicesConcept {
  id: string;
  name: string;
  definition: string;
  category: string;
  validation: {
    lastUpdated: string;
    source: string;
  };
}

export const AWSSERVICES_CONCEPTS: Record<string, AWSServicesConcept> = {
  LAMBDA: {
    id: 'LAMBDA',
    name: 'AWS Lambda',
    definition: 'Serverless compute: 128MB-10,240MB memory, 15min max timeout, pay-per-invocation',
    category: 'compute',
    validation: {
      lastUpdated: new Date().toISOString(),
      source: 'authoritative'
    }
  },
  S3: {
    id: 'S3',
    name: 'Amazon S3',
    definition: 'Object storage: No built-in CDN (use CloudFront), 5TB max object size, eventual consistency',
    category: 'storage',
    validation: {
      lastUpdated: new Date().toISOString(),
      source: 'authoritative'
    }
  },
  RDS: {
    id: 'RDS',
    name: 'Amazon RDS',
    definition: 'Managed database: Storage auto-scales, compute requires manual scaling, supports read replicas',
    category: 'database',
    validation: {
      lastUpdated: new Date().toISOString(),
      source: 'authoritative'
    }
  }
};

export function validateAWSServicesConcept(id: string): AWSServicesConcept | null {
  return AWSSERVICES_CONCEPTS[id] || null;
}

export function searchAWSServices(query: string): AWSServicesConcept[] {
  return Object.values(AWSSERVICES_CONCEPTS)
    .filter(concept => 
      concept.name.toLowerCase().includes(query.toLowerCase()) ||
      concept.definition.toLowerCase().includes(query.toLowerCase())
    );
}

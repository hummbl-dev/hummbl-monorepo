/**
 * Kubernetes Authoritative Definitions
 * 
 * Single source of truth for all kubernetes concepts
 */

export interface KubernetesConcept {
  id: string;
  name: string;
  definition: string;
  category: string;
  validation: {
    lastUpdated: string;
    source: string;
  };
}

export const KUBERNETES_CONCEPTS: Record<string, KubernetesConcept> = {
  DEPLOYMENT: {
    id: 'DEPLOYMENT',
    name: 'Deployment',
    definition: 'Manages ReplicaSets and Pods. NO built-in load balancing (requires Service), NO persistent storage (requires PVC)',
    category: 'workload',
    validation: {
      lastUpdated: new Date().toISOString(),
      source: 'authoritative'
    }
  },
  CONFIGMAP: {
    id: 'CONFIGMAP',
    name: 'ConfigMap',
    definition: 'Stores non-sensitive config data as key-value pairs. NO binary data support (use Secret), 1MB size limit',
    category: 'config',
    validation: {
      lastUpdated: new Date().toISOString(),
      source: 'authoritative'
    }
  },
  PVC: {
    id: 'PVC',
    name: 'PersistentVolumeClaim',
    definition: 'Requests storage from PV. NO auto-expansion (depends on StorageClass allowVolumeExpansion), NO built-in backup',
    category: 'storage',
    validation: {
      lastUpdated: new Date().toISOString(),
      source: 'authoritative'
    }
  }
};

export function validateKubernetesConcept(id: string): KubernetesConcept | null {
  return KUBERNETES_CONCEPTS[id] || null;
}

export function searchKubernetes(query: string): KubernetesConcept[] {
  return Object.values(KUBERNETES_CONCEPTS)
    .filter(concept => 
      concept.name.toLowerCase().includes(query.toLowerCase()) ||
      concept.definition.toLowerCase().includes(query.toLowerCase())
    );
}

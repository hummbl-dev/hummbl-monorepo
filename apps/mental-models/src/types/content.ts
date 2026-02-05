export interface ContentVersion {
  id: string;
  content_id: string;
  type: 'narrative' | 'mental-model' | 'other';
  version: number;
  timestamp: string;
  author: string;
  changes: string[];
  approved?: boolean;
}

export interface VersionDiff {
  added: string[];
  removed: string[];
  changed: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
}

export interface ContentChange<T = any> {
  id: string;
  type: 'create' | 'update' | 'delete' | 'field_update';
  timestamp: string;
  author: string;
  field?: string;
  new_value?: any;
  old_value?: any;
  data?: T;
  previousData?: T;
  diff?: VersionDiff & {
    content_id?: string;
    approved?: boolean;
  };
}

export type SystemTabId = 'overview' | 'browser' | 'system';

export interface SystemDetailEntry {
  label: string;
  value: string;
}

export interface SystemFeatureItem {
  id: string;
  label: string;
  supported: boolean;
}

export interface SystemSuspicion {
  label: string;
  summary: string;
  tone: 'safe' | 'warn' | 'danger';
}

export interface SystemSnapshot {
  deviceId: string;
  supportPercent: number;
  supportedCount: number;
  totalFeatures: number;
  suspicion: SystemSuspicion;
  overview: SystemDetailEntry[];
  browser: SystemDetailEntry[];
  system: SystemDetailEntry[];
  supportedFeatures: SystemFeatureItem[];
  missingFeatures: SystemFeatureItem[];
}

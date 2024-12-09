export type ExportFormat = 'json' | 'yaml';

export interface ExportOptions {
  includeMetadata?: boolean;
  excludeSimulationLogs?: boolean;
  compressOutput?: boolean;
}
export interface DataRow {
  [key: string]: string | number;
}

export interface AnalysisResult {
  columnName: string;
  mean?: number;
  median?: number;
  mode?: string | number;
  min?: number;
  max?: number;
  count: number;
  type: 'numeric' | 'categorical';
  quartiles?: {
    q1: number;
    q3: number;
  };
  standardDeviation?: number;
  histogram?: { bin: string; count: number }[];
}

export interface Filter {
  column: string;
  operator: 'equals' | 'contains' | 'greater' | 'less' | 'between';
  value: string | number;
  value2?: string | number; // For 'between' operator
}

export interface Sort {
  column: string;
  direction: 'asc' | 'desc';
}
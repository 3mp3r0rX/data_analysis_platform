export interface DataRow {
  [key: string]: string | number | null | undefined;
}

export interface AnalysisResult {
  columnName: string;
  type: 'numeric' | 'categorical' | 'datetime';
  count: number;
  nullCount?: number;
  uniqueCount?: number;
  mean?: number;
  median?: number;
  min?: number;
  max?: number;
  standardDeviation?: number;
  quartiles?: {
    q1: number;
    q3: number;
  };
  mode?: string | number;
  categories?: { [key: string]: number };
  dateRange?: {
    start: string;
    end: string;
  };
  histogram: Array<{
    bin: string;
    count: number;
  }>;
  correlations?: {
    [columnName: string]: number;
  };
}

export interface Filter {
  column: string;
  operator: 'equals' | 'contains' | 'greater' | 'less' | 'between' | 'startsWith' | 'endsWith' | 'isNull' | 'isNotNull';
  value: string;
  value2?: string;
}

export interface Sort {
  column: string;
  direction: 'asc' | 'desc';
}

export interface ChartConfig {
  type: 'line' | 'bar' | 'scatter' | 'pie' | 'area' | 'bubble' | 'heatmap' | 'boxplot';
  xAxis: string;
  yAxis: string;
  groupBy?: string;
  aggregation?: 'sum' | 'average' | 'count' | 'min' | 'max';
  title?: string;
  showLegend?: boolean;
  colors?: string[];
}

export interface CodeExecutionResult {
  success: boolean;
  output: string;
  error?: string;
  duration?: number;
  memoryUsage?: number;
}

export interface DataTransformation {
  type: 'filter' | 'sort' | 'aggregate' | 'join' | 'pivot' | 'unpivot';
  config: any;
}

export interface ExportConfig {
  format: 'csv' | 'xlsx' | 'json' | 'pdf';
  fileName?: string;
  includeAnalysis?: boolean;
  includeVisualizations?: boolean;
}
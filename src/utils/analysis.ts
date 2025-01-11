import { DataRow, AnalysisResult, Filter, Sort } from '../types';

const calculateQuartiles = (numbers: number[]) => {
  const sorted = [...numbers].sort((a, b) => a - b);
  const q1Index = Math.floor(sorted.length * 0.25);
  const q3Index = Math.floor(sorted.length * 0.75);

  return {
    q1: sorted[q1Index] ?? 0,
    q3: sorted[q3Index] ?? 0,
  };
};

const calculateStandardDeviation = (numbers: number[], mean: number): number => {
  const variance =
    numbers.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / numbers.length;
  return Math.sqrt(variance);
};

const createHistogram = (values: (string | number | null | undefined)[], bins = 10) => {
  const cleanValues = values.filter((v): v is string | number => v != null);

  if (cleanValues.length === 0) {
    return [{ bin: 'No Data', count: 0 }];
  }

  const isNumeric = cleanValues.every((val) => typeof val === 'number' || !isNaN(Number(val)));

  if (isNumeric) {
    const numbers = cleanValues.map((v) => Number(v));
    const min = Math.min(...numbers);
    const max = Math.max(...numbers);
    const binSize = (max - min) / bins;

    const histogram = Array.from({ length: bins }, (_, i) => ({
      bin: `${(min + i * binSize).toFixed(2)} - ${(min + (i + 1) * binSize).toFixed(2)}`,
      count: 0,
    }));

    numbers.forEach((num) => {
      const binIndex = Math.min(Math.floor((num - min) / binSize), bins - 1);
      histogram[binIndex].count++;
    });

    return histogram;
  } else {
    const counts: Record<string, number> = {};
    cleanValues.forEach((val) => {
      const key = String(val);
      counts[key] = (counts[key] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([bin, count]) => ({ bin, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, bins);
  }
};

const getMostFrequent = (values: (string | number)[]): string | number => {
  const counts: Record<string, number> = values.reduce((acc, val) => {
    const key = String(val);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts).reduce((mostFrequent, [key, count]) =>
    count > counts[mostFrequent] ? key : mostFrequent,
  )[0];
};

export const analyzeColumn = (data: DataRow[], columnName: string): AnalysisResult => {
  const values = data.map((row) => row[columnName]);
  const cleanValues = values.filter((val) => val != null);

  if (cleanValues.length === 0) {
    return {
      columnName,
      type: 'categorical',
      count: 0,
      mode: 'No Data',
      histogram: [{ bin: 'No Data', count: 0 }],
    };
  }

  const isNumeric = cleanValues.every((val) => !isNaN(Number(val)));

  if (isNumeric) {
    const numbers = cleanValues.map((val) => Number(val));
    const mean = numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
    const sorted = [...numbers].sort((a, b) => a - b);

    return {
      columnName,
      type: 'numeric',
      mean,
      median: sorted[Math.floor(sorted.length / 2)],
      min: Math.min(...numbers),
      max: Math.max(...numbers),
      count: numbers.length,
      quartiles: calculateQuartiles(numbers),
      standardDeviation: calculateStandardDeviation(numbers, mean),
      histogram: createHistogram(numbers),
    };
  }

  return {
    columnName,
    type: 'categorical',
    mode: getMostFrequent(cleanValues),
    count: cleanValues.length,
    histogram: createHistogram(cleanValues),
  };
};

export const filterData = (data: DataRow[], filters: Filter[]): DataRow[] => {
  return data.filter((row) =>
    filters.every((filter) => {
      const value = row[filter.column];
      const filterValue = filter.value;

      if (value == null) return false;

      switch (filter.operator) {
        case 'equals':
          return String(value) === String(filterValue);
        case 'contains':
          return String(value).toLowerCase().includes(String(filterValue).toLowerCase());
        case 'greater':
          return Number(value) > Number(filterValue);
        case 'less':
          return Number(value) < Number(filterValue);
        case 'between':
          return (
            Number(value) >= Number(filterValue) && Number(value) <= Number(filter.value2)
          );
        default:
          return true;
      }
    }),
  );
};

export const sortData = (data: DataRow[], sort?: Sort): DataRow[] => {
  if (!sort) return data;

  return [...data].sort((a, b) => {
    const aVal = a[sort.column];
    const bVal = b[sort.column];

    if (aVal == null) return 1;
    if (bVal == null) return -1;

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sort.direction === 'asc' ? aVal - bVal : bVal - aVal;
    }

    return sort.direction === 'asc'
      ? String(aVal).localeCompare(String(bVal))
      : String(bVal).localeCompare(String(aVal));
  });
};

export const calculateCorrelation = (
  data: DataRow[],
  colX: string,
  colY: string,
): number | string => {
  const xValues = data.map((row) => row[colX]).filter((val) => typeof val === 'number') as number[];
  const yValues = data.map((row) => row[colY]).filter((val) => typeof val === 'number') as number[];

  if (xValues.length !== yValues.length || xValues.length === 0) {
    return 'Insufficient or mismatched data';
  }

  const meanX = xValues.reduce((sum, val) => sum + val, 0) / xValues.length;
  const meanY = yValues.reduce((sum, val) => sum + val, 0) / yValues.length;

  let numerator = 0;
  let denominatorX = 0;
  let denominatorY = 0;

  xValues.forEach((x, i) => {
    const dx = x - meanX;
    const dy = yValues[i] - meanY;

    numerator += dx * dy;
    denominatorX += dx ** 2;
    denominatorY += dy ** 2;
  });

  const denominator = Math.sqrt(denominatorX * denominatorY);

  return denominator === 0 ? 'No correlation (division by zero)' : numerator / denominator;
};

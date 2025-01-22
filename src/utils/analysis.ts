import { DataRow, AnalysisResult, Filter, Sort } from '../types';

const calculateQuartiles = (numbers: number[]) => {
  const sorted = [...numbers].sort((a, b) => a - b);
  const q1Index = Math.floor(sorted.length * 0.25);
  const q3Index = Math.floor(sorted.length * 0.75);
  
  return {
    q1: sorted[q1Index],
    q3: sorted[q3Index]
  };
};

const calculateStandardDeviation = (numbers: number[], mean: number) => {
  const squareDiffs = numbers.map(value => Math.pow(value - mean, 2));
  const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / numbers.length;
  return Math.sqrt(avgSquareDiff);
};

const createHistogram = (values: (string | number | null | undefined)[], bins = 10) => {
  if (!Array.isArray(values) || values.length === 0) {
    return [{ bin: 'No Data', count: 0 }];
  }

  // Filter out null/undefined values and convert to strings/numbers
  const cleanValues = values.filter((v): v is string | number => 
    v !== null && v !== undefined && v !== ''
  );
  
  if (cleanValues.length === 0) {
    return [{ bin: 'No Data', count: 0 }];
  }

  // Check if values can be treated as numbers
  const allNumbers = cleanValues.every(v => !isNaN(Number(v)));

  if (allNumbers) {
    const numbers = cleanValues.map(v => Number(v));
    const min = Math.min(...numbers);
    const max = Math.max(...numbers);
    
    // Handle case where all values are the same
    if (min === max) {
      return [{
        bin: min.toFixed(2),
        count: numbers.length
      }];
    }
    
    const binSize = (max - min) / bins;
    const histogram = Array(bins).fill(0).map((_, i) => ({
      bin: `${(min + i * binSize).toFixed(2)} - ${(min + (i + 1) * binSize).toFixed(2)}`,
      count: 0
    }));
    
    numbers.forEach(num => {
      const binIndex = Math.min(Math.floor((num - min) / binSize), bins - 1);
      histogram[binIndex].count++;
    });
    
    return histogram;
  } else {
    // Handle categorical data
    const counts: { [key: string]: number } = {};
    cleanValues.forEach(val => {
      const key = String(val);
      counts[key] = (counts[key] || 0) + 1;
    });
    
    return Object.entries(counts)
      .map(([bin, count]) => ({ bin, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, bins);
  }
};

export const analyzeColumn = (data: DataRow[], columnName: string): AnalysisResult => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return {
      columnName,
      type: 'categorical',
      count: 0,
      mode: 'No Data',
      histogram: [{ bin: 'No Data', count: 0 }]
    };
  }

  const values = data.map(row => row[columnName]);
  const cleanValues = values.filter(val => 
    val !== null && val !== undefined && val !== ''
  );
  
  if (cleanValues.length === 0) {
    return {
      columnName,
      type: 'categorical',
      count: 0,
      mode: 'No Data',
      histogram: [{ bin: 'No Data', count: 0 }]
    };
  }

  const isNumeric = cleanValues.every(val => !isNaN(Number(val)));
  
  if (isNumeric) {
    const numbers = cleanValues.map(v => Number(v));
    const sorted = [...numbers].sort((a, b) => a - b);
    const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
    
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
      histogram: createHistogram(numbers)
    };
  }
  
  return {
    columnName,
    type: 'categorical',
    mode: getMostFrequent(cleanValues),
    count: cleanValues.length,
    histogram: createHistogram(cleanValues)
  };
};

const getMostFrequent = (arr: (string | number)[]): string | number => {
  if (!Array.isArray(arr) || arr.length === 0) return 'No Data';
  
  const counts = arr.reduce((acc: { [key: string]: number }, val) => {
    const key = String(val);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  
  return Object.entries(counts).reduce((a, b) => 
    counts[a[0]] > counts[b[0]] ? a : b
  )[0];
};

export const filterData = (data: DataRow[], filters: Filter[]): DataRow[] => {
  if (!Array.isArray(data)) return [];
  
  return data.filter(row => {
    return filters.every(filter => {
      const value = row[filter.column];
      const filterValue = filter.value;
      
      // Handle null/undefined values
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
          return Number(value) >= Number(filterValue) && Number(value) <= Number(filter.value2);
        default:
          return true;
      }
    });
  });
};

export const sortData = (data: DataRow[], sort?: Sort): DataRow[] => {
  if (!Array.isArray(data)) return [];
  if (!sort) return data;
  
  return [...data].sort((a, b) => {
    const aVal = a[sort.column];
    const bVal = b[sort.column];
    
    // Handle null/undefined values in sorting
    if (aVal == null) return 1;
    if (bVal == null) return -1;
    if (aVal == null && bVal == null) return 0;
    
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sort.direction === 'asc' ? aVal - bVal : bVal - aVal;
    }
    
    return sort.direction === 'asc'
      ? String(aVal).localeCompare(String(bVal))
      : String(bVal).localeCompare(String(aVal));
  });
};
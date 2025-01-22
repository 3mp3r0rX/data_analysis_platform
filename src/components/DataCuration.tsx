import React, { useState } from 'react';
import { DataRow } from '../types';
import { Wand2, Save, AlertTriangle, Check } from 'lucide-react';

interface DataCurationProps {
  data: DataRow[];
  columns: string[];
  onSave: (data: DataRow[]) => void;
}

export const DataCuration: React.FC<DataCurationProps> = ({ data, columns, onSave }) => {
  const [curatedData, setCuratedData] = useState<DataRow[]>(data);
  const [selectedColumn, setSelectedColumn] = useState<string>(columns[0]);
  const [operation, setOperation] = useState<string>('');
  const [replacementValue, setReplacementValue] = useState<string>('');

  const getMissingValueCount = (column: string) => {
    return data.filter(row => 
      row[column] === null || 
      row[column] === undefined || 
      row[column] === '' || 
      Number.isNaN(row[column])
    ).length;
  };

  const getColumnStats = (column: string) => {
    const values = data.map(row => row[column]).filter(val => val !== null && val !== undefined);
    const numericValues = values.map(v => Number(v)).filter(n => !isNaN(n));
    
    return {
      missingCount: getMissingValueCount(column),
      uniqueCount: new Set(values).size,
      isNumeric: numericValues.length === values.length,
      mean: numericValues.length > 0 ? 
        (numericValues.reduce((a, b) => a + b, 0) / numericValues.length).toFixed(2) : 
        null
    };
  };

  const handleOperation = () => {
    const newData = [...curatedData];
    
    switch (operation) {
      case 'fillMissing':
        newData.forEach(row => {
          if (row[selectedColumn] === null || 
              row[selectedColumn] === undefined || 
              row[selectedColumn] === '' || 
              Number.isNaN(row[selectedColumn])) {
            row[selectedColumn] = replacementValue;
          }
        });
        break;

      case 'convertToNumber':
        newData.forEach(row => {
          const num = Number(row[selectedColumn]);
          if (!isNaN(num)) {
            row[selectedColumn] = num;
          }
        });
        break;

      case 'trim':
        newData.forEach(row => {
          if (typeof row[selectedColumn] === 'string') {
            row[selectedColumn] = row[selectedColumn].trim();
          }
        });
        break;

      case 'uppercase':
        newData.forEach(row => {
          if (typeof row[selectedColumn] === 'string') {
            row[selectedColumn] = row[selectedColumn].toUpperCase();
          }
        });
        break;

      case 'lowercase':
        newData.forEach(row => {
          if (typeof row[selectedColumn] === 'string') {
            row[selectedColumn] = row[selectedColumn].toLowerCase();
          }
        });
        break;
    }

    setCuratedData(newData);
  };

  const stats = getColumnStats(selectedColumn);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Data Curation</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Column
            </label>
            <select
              value={selectedColumn}
              onChange={(e) => setSelectedColumn(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              {columns.map(col => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Operation
            </label>
            <select
              value={operation}
              onChange={(e) => setOperation(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select operation...</option>
              <option value="fillMissing">Fill Missing Values</option>
              <option value="convertToNumber">Convert to Number</option>
              <option value="trim">Trim Whitespace</option>
              <option value="uppercase">Convert to Uppercase</option>
              <option value="lowercase">Convert to Lowercase</option>
            </select>
          </div>
        </div>

        {operation === 'fillMissing' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Replacement Value
            </label>
            <input
              type="text"
              value={replacementValue}
              onChange={(e) => setReplacementValue(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter value to replace missing data"
            />
          </div>
        )}

        <div className="flex space-x-4">
          <button
            onClick={handleOperation}
            disabled={!operation}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Wand2 className="h-4 w-4 mr-2" />
            Apply Operation
          </button>
          
          <button
            onClick={() => onSave(curatedData)}
            className="flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Column Statistics</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-2 p-4 bg-gray-50 rounded-lg">
            <AlertTriangle className={`h-5 w-5 ${stats.missingCount > 0 ? 'text-yellow-500' : 'text-green-500'}`} />
            <div>
              <p className="text-sm text-gray-500">Missing Values</p>
              <p className="text-lg font-semibold">{stats.missingCount}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 p-4 bg-gray-50 rounded-lg">
            <Check className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-sm text-gray-500">Unique Values</p>
              <p className="text-lg font-semibold">{stats.uniqueCount}</p>
            </div>
          </div>
          
          {stats.isNumeric && stats.mean !== null && (
            <div className="flex items-center space-x-2 p-4 bg-gray-50 rounded-lg">
              <Check className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-500">Mean Value</p>
                <p className="text-lg font-semibold">{stats.mean}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
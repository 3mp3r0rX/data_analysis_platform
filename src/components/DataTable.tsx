import React, { useState } from 'react';
import { DataRow, Filter, Sort } from '../types';
import { filterData, sortData } from '../utils/analysis';
import { Filter as FilterIcon, ArrowUpDown, Download } from 'lucide-react';

interface DataTableProps {
  data: DataRow[];
  columns: string[];
}

export const DataTable: React.FC<DataTableProps> = ({ data, columns }) => {
  const [filters, setFilters] = useState<Filter[]>([]);
  const [sort, setSort] = useState<Sort>();
  const [showFilters, setShowFilters] = useState(false);

  const filteredData = filterData(data, filters);
  const sortedData = sortData(filteredData, sort);

  const handleAddFilter = () => {
    setFilters([...filters, {
      column: columns[0],
      operator: 'equals',
      value: ''
    }]);
    setShowFilters(true);
  };

  const handleRemoveFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  const handleFilterChange = (index: number, field: keyof Filter, value: string) => {
    const newFilters = [...filters];
    if (field === 'value' || field === 'value2') {
      newFilters[index] = { ...newFilters[index], [field]: value };
    } else if (field === 'operator') {
      newFilters[index] = { ...newFilters[index], operator: value as Filter['operator'] };
    } else {
      newFilters[index] = { ...newFilters[index], column: value };
    }
    setFilters(newFilters);
  };

  const handleSort = (column: string) => {
    if (sort?.column === column) {
      setSort({
        column,
        direction: sort.direction === 'asc' ? 'desc' : 'asc'
      });
    } else {
      setSort({ column, direction: 'asc' });
    }
  };

  const exportCSV = () => {
    const headers = columns.join(',');
    const rows = sortedData.map(row => 
      columns.map(col => `"${row[col]}"`).join(',')
    ).join('\n');
    const csv = `${headers}\n${rows}`;
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data_export.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <div className="flex space-x-2">
          <button
            onClick={handleAddFilter}
            className="flex items-center px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            <FilterIcon className="h-4 w-4 mr-2" />
            Add Filter
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-3 py-2 text-gray-600 hover:text-gray-800"
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>
        <button
          onClick={exportCSV}
          className="flex items-center px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </button>
      </div>

      {showFilters && filters.length > 0 && (
        <div className="mb-4 space-y-2">
          {filters.map((filter, index) => (
            <div key={index} className="flex space-x-2 items-center">
              <select
                value={filter.column}
                onChange={(e) => handleFilterChange(index, 'column', e.target.value)}
                className="border rounded px-2 py-1"
              >
                {columns.map(col => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
              <select
                value={filter.operator}
                onChange={(e) => handleFilterChange(index, 'operator', e.target.value)}
                className="border rounded px-2 py-1"
              >
                <option value="equals">equals</option>
                <option value="contains">contains</option>
                <option value="greater">greater than</option>
                <option value="less">less than</option>
                <option value="between">between</option>
              </select>
              <input
                type="text"
                value={filter.value}
                onChange={(e) => handleFilterChange(index, 'value', e.target.value)}
                className="border rounded px-2 py-1"
                placeholder="Value"
              />
              {filter.operator === 'between' && (
                <input
                  type="text"
                  value={filter.value2 || ''}
                  onChange={(e) => handleFilterChange(index, 'value2', e.target.value)}
                  className="border rounded px-2 py-1"
                  placeholder="Second Value"
                />
              )}
              <button
                onClick={() => handleRemoveFilter(index)}
                className="text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort(column)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column}</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedData.slice(0, 100).map((row, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                {columns.map((column) => (
                  <td key={column} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {row[column]?.toString()}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {sortedData.length > 100 && (
          <p className="text-sm text-gray-500 mt-2 text-center">
            Showing first 100 rows of {sortedData.length} total rows
          </p>
        )}
      </div>
    </div>
  );
};
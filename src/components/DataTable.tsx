import React, { useState, useMemo } from 'react';
import { DataRow, Filter, Sort } from '../types';
import { filterData, sortData } from '../utils/analysis';
import { 
  Filter as FilterIcon, 
  ArrowUpDown, 
  Download, 
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';

interface DataTableProps {
  data: DataRow[];
  columns: string[];
}

export const DataTable: React.FC<DataTableProps> = ({ data, columns }) => {
  const [filters, setFilters] = useState<Filter[]>([]);
  const [sort, setSort] = useState<Sort>();
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const searchedData = useMemo(() => {
    if (!searchTerm) return data;
    return data.filter(row => 
      Object.values(row).some(value => 
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [data, searchTerm]);

  const filteredData = useMemo(() => filterData(searchedData, filters), [searchedData, filters]);
  const sortedData = useMemo(() => sortData(filteredData, sort), [filteredData, sort]);

  const totalPages = Math.ceil(sortedData.length / rowsPerPage);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

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
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex-1 w-full md:w-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Search data..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10 pr-4 w-full"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleAddFilter}
            className="btn-secondary"
          >
            <FilterIcon className="h-4 w-4 mr-2" />
            Add Filter
          </button>
          <button
            onClick={exportCSV}
            className="btn-primary"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </button>
        </div>
      </div>

      {showFilters && filters.length > 0 && (
        <div className="space-y-2 p-4 card">
          <h3 className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-3">
            Active Filters
          </h3>
          {filters.map((filter, index) => (
            <div key={index} className="flex flex-wrap gap-2 items-center bg-light-background dark:bg-dark-background p-3 rounded-lg">
              <select
                value={filter.column}
                onChange={(e) => handleFilterChange(index, 'column', e.target.value)}
                className="input !py-1"
              >
                {columns.map(col => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
              <select
                value={filter.operator}
                onChange={(e) => handleFilterChange(index, 'operator', e.target.value)}
                className="input !py-1"
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
                className="input !py-1"
                placeholder="Value"
              />
              {filter.operator === 'between' && (
                <input
                  type="text"
                  value={filter.value2 || ''}
                  onChange={(e) => handleFilterChange(index, 'value2', e.target.value)}
                  className="input !py-1"
                  placeholder="Second Value"
                />
              )}
              <button
                onClick={() => handleRemoveFilter(index)}
                className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                aria-label="Remove filter"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-light-border dark:divide-dark-border">
            <thead className="bg-light-background dark:bg-dark-background">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column}
                    onClick={() => handleSort(column)}
                    className="group px-6 py-3 text-left text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wider cursor-pointer hover:bg-light-border/50 dark:hover:bg-dark-border/50"
                  >
                    <div className="flex items-center space-x-1">
                      <span>{column}</span>
                      <ArrowUpDown className={`
                        h-4 w-4 transition-colors duration-200
                        ${sort?.column === column 
                          ? 'text-light-primary dark:text-dark-primary' 
                          : 'text-gray-400 group-hover:text-gray-600 dark:text-gray-600 dark:group-hover:text-gray-400'
                        }
                      `} />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-light-surface dark:bg-dark-surface divide-y divide-light-border dark:divide-dark-border">
              {paginatedData.map((row, idx) => (
                <tr 
                  key={idx}
                  className="hover:bg-light-background dark:hover:bg-dark-background transition-colors duration-150"
                >
                  {columns.map((column) => (
                    <td key={column} className="px-6 py-4 whitespace-nowrap text-sm text-light-text-primary dark:text-dark-text-primary">
                      {row[column]?.toString()}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 bg-light-background dark:bg-dark-background border-t border-light-border dark:border-dark-border">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="input !py-1"
              >
                {[10, 25, 50, 100].map(value => (
                  <option key={value} value={value}>
                    {value} rows
                  </option>
                ))}
              </select>
              <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                Showing {(currentPage - 1) * rowsPerPage + 1} to {Math.min(currentPage * rowsPerPage, sortedData.length)} of {sortedData.length} entries
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="p-1 text-light-text-secondary dark:text-dark-text-secondary disabled:opacity-50"
              >
                <ChevronsLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-1 text-light-text-secondary dark:text-dark-text-secondary disabled:opacity-50"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum = currentPage;
                  if (currentPage < 3) {
                    pageNum = i + 1;
                  } else if (currentPage > totalPages - 2) {
                    pageNum = totalPages - (4 - i);
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  if (pageNum > 0 && pageNum <= totalPages) {
                    return (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`
                          w-8 h-8 rounded-full text-sm font-medium transition-colors duration-200
                          ${currentPage === pageNum
                            ? 'bg-light-primary dark:bg-dark-primary text-white'
                            : 'text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-border dark:hover:bg-dark-border'
                          }
                        `}
                      >
                        {pageNum}
                      </button>
                    );
                  }
                  return null;
                })}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-1 text-light-text-secondary dark:text-dark-text-secondary disabled:opacity-50"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="p-1 text-light-text-secondary dark:text-dark-text-secondary disabled:opacity-50"
              >
                <ChevronsRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
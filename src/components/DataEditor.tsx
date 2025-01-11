import React, { useState, useEffect } from 'react';
import { DataRow } from '../types';
import { Save } from 'lucide-react';

interface DataEditorProps {
  data: DataRow[];
  columns: string[];
  onSave: (data: DataRow[]) => void;
}

export const DataEditor: React.FC<DataEditorProps> = ({ data, columns, onSave }) => {
  const [editedData, setEditedData] = useState<DataRow[]>(data);

  useEffect(() => {
    setEditedData(data);
  }, [data]);

  const handleCellChange = (rowIndex: number, column: string, value: string) => {
    const newData = [...editedData];
    newData[rowIndex] = {
      ...newData[rowIndex],
      [column]: value
    };
    setEditedData(newData);
  };

  return (
    <div className="overflow-auto">
      <div className="flex justify-end mb-2">
        <button
          onClick={() => onSave(editedData)}
          className="flex items-center px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </button>
      </div>
      <div className="border rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {editedData.slice(0, 100).map((row, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((column) => (
                  <td key={column} className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="text"
                      value={row[column]?.toString() || ''}
                      onChange={(e) => handleCellChange(rowIndex, column, e.target.value)}
                      className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
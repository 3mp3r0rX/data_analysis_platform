import React, { useCallback } from 'react';
import { Upload } from 'lucide-react';
import { read, utils } from 'xlsx';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  onSqlFileUpload?: (file: File) => void;
  onSqliteFileUpload?: (file: File) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ 
  onFileUpload, 
  onSqlFileUpload,
  onSqliteFileUpload 
}) => {
  const handleFile = async (file: File) => {
    const fileName = file.name.toLowerCase();
    
    if (fileName.endsWith('.sql')) {
      onSqlFileUpload?.(file);
      return;
    }
    
    if (fileName.endsWith('.sqlite') || fileName.endsWith('.db')) {
      onSqliteFileUpload?.(file);
      return;
    }

    if (fileName.endsWith('.csv')) {
      onFileUpload(file);
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      try {
        const buffer = await file.arrayBuffer();
        const workbook = read(buffer);
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = utils.sheet_to_json(firstSheet);
        
        if (data.length === 0) {
          alert('The Excel file appears to be empty');
          return;
        }
        
        const csvContent = new Blob([
          Object.keys(data[0]).join(',') + '\n' +
          data.map(row => Object.values(row).join(',')).join('\n')
        ], { type: 'text/csv' });
        
        const csvFile = new File([csvContent], file.name.replace(/\.xlsx?$/i, '.csv'), {
          type: 'text/csv'
        });
        
        onFileUpload(csvFile);
      } catch (error) {
        alert('Error processing Excel file: ' + error.message);
      }
    } else {
      alert('Please upload a valid CSV, Excel, SQL, or SQLite file');
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="space-y-6">
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors"
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          Drag and drop your file here, or{' '}
          <label className="text-blue-500 hover:text-blue-600 cursor-pointer">
            browse
            <input
              type="file"
              className="hidden"
              accept=".csv,.xlsx,.xls,.sql,.sqlite,.db"
              onChange={handleChange}
            />
          </label>
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Supported formats:
        </p>
        <ul className="text-xs text-gray-500 mt-1">
          <li>SQLite databases (.sqlite, .db)</li>
          <li>SQL files (.sql)</li>
          <li>CSV files (.csv)</li>
          <li>Excel files (.xlsx, .xls)</li>
        </ul>
      </div>
    </div>
  );
};
import React, { useCallback, useState } from 'react';
import { Upload, FileType, AlertCircle, CheckCircle2 } from 'lucide-react';
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
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{
    status: 'idle' | 'error' | 'success';
    message: string;
  }>({ status: 'idle', message: '' });

  const handleFile = async (file: File) => {
    const fileName = file.name.toLowerCase();
    const maxSize = 50 * 1024 * 1024; // 50MB file size limit

    console.log("Selected file:", fileName); // Debugging line to check the file name
    
    if (file.size > maxSize) {
      setUploadStatus({
        status: 'error',
        message: 'File size exceeds 50MB limit'
      });
      return;
    }
    
    try {
      // Check file type and handle accordingly
      if (fileName.endsWith('.sql')) {
        console.log("SQL file detected"); // Debugging line for .sql file detection
        onSqlFileUpload?.(file);
        setUploadStatus({
          status: 'success',
          message: 'SQL file uploaded successfully'
        });
      } else if (fileName.endsWith('.sqlite') || fileName.endsWith('.db')) {
        console.log("SQLite file detected"); // Debugging line for SQLite file detection
        await onSqliteFileUpload?.(file);
        setUploadStatus({
          status: 'success',
          message: 'SQLite database loaded successfully'
        });
      } else if (fileName.endsWith('.csv')) {
        console.log("CSV file detected"); // Debugging line for .csv file detection
        onFileUpload(file);
        setUploadStatus({
          status: 'success',
          message: 'CSV file uploaded successfully'
        });
      } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        console.log("Excel file detected"); // Debugging line for Excel file detection
        try {
          const buffer = await file.arrayBuffer();
          const workbook = read(buffer);
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const data = utils.sheet_to_json(firstSheet);
          
          if (data.length === 0) {
            throw new Error('The Excel file appears to be empty');
          }
          
          const csvContent = new Blob([Object.keys(data[0]).join(',') + '\n' + data.map(row => Object.values(row).join(',')).join('\n')], { type: 'text/csv' });
          
          const csvFile = new File([csvContent], file.name.replace(/\.xlsx?$/i, '.csv'), {
            type: 'text/csv'
          });
          
          onFileUpload(csvFile);
          setUploadStatus({
            status: 'success',
            message: 'Excel file converted and uploaded successfully'
          });
        } catch (error) {
          setUploadStatus({
            status: 'error',
            message: 'Error processing Excel file: ' + error.message
          });
        }
      } else {
        setUploadStatus({
          status: 'error',
          message: 'Please upload a valid CSV, Excel, SQL, or SQLite file'
        });
      }
    } catch (error) {
      setUploadStatus({
        status: 'error',
        message: error.message || 'Error uploading file'
      });
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-3xl bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-8">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Data Analysis Platform
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Transform your data into insights
          </p>
        </div>

        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            relative rounded-xl p-12 text-center transition-all duration-300
            ${isDragging 
              ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-dashed border-blue-500' 
              : 'bg-gray-50 dark:bg-gray-900/50 border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-blue-500'
            }
          `}
        >
          <div className="space-y-6">
            <div className={`
              transition-transform duration-300
              ${isDragging ? 'scale-110' : 'scale-100'}
            `}>
              <Upload className={`
                mx-auto h-16 w-16 transition-colors duration-300
                ${isDragging ? 'text-blue-500' : 'text-gray-400 dark:text-gray-600'}
              `} />
            </div>
            
            <div className="space-y-4">
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Drag and drop your file here, or{' '}
                <label className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer font-medium">
                  browse files
                  <input
                    type="file"
                    className="hidden"
                    accept=".csv,.xlsx,.xls,.sql,.sqlite,.db"
                    onChange={handleChange}
                  />
                </label>
              </p>
              
              {uploadStatus.status !== 'idle' && (
                <div className={`
                  flex items-center justify-center space-x-2 text-base font-medium
                  ${uploadStatus.status === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}
                `}>
                  {uploadStatus.status === 'success' ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <AlertCircle className="h-5 w-5" />
                  )}
                  <span>{uploadStatus.message}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white text-center">
            Supported Formats
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[{ ext: 'CSV', desc: 'Comma-separated values' },
              { ext: 'XLSX', desc: 'Excel workbook' },
              { ext: 'SQL', desc: 'SQL query files' },
              { ext: 'SQLite', desc: 'SQLite databases' }
            ].map(format => (
              <div
                key={format.ext}
                className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 hover:border-blue-500 transition-colors duration-300"
              >
                <FileType className="h-8 w-8 text-blue-500 dark:text-blue-400 mb-2" />
                <p className="font-medium text-gray-900 dark:text-white">{format.ext}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{format.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Maximum file size: 50MB
          </p>
        </div>
      </div>
    </div>
  );
};

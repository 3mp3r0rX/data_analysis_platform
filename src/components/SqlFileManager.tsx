import React, { useState, useCallback } from 'react';
import { File, Play, Trash2, Eye, X } from 'lucide-react';

interface SqlFile {
  id: string;
  name: string;
  content: string;
}

interface SqlFileManagerProps {
  files: SqlFile[];
  onExecute: (content: string) => void;
  onDelete: (id: string) => void;
  executeSQL: () => Promise<void>;
  sqlQuery: string;
  setSqlQuery: React.Dispatch<React.SetStateAction<string>>;
  sqlOutput: string;
  isExecutingSql: boolean;
}

export const SqlFileManager: React.FC<SqlFileManagerProps> = ({
  files = [],
  onExecute,
  onDelete,
}) => {
  const [selectedFile, setSelectedFile] = useState<SqlFile | null>(null);

  const handleFileSelection = useCallback((file: SqlFile) => {
    setSelectedFile((prev) => (prev?.id === file.id ? null : file));
  }, []);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white">SQL Files</h3>

      {files.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">
          No SQL files uploaded yet. Upload a <code>.sql</code> file to get started.
        </p>
      ) : (
        <div className="space-y-2">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-lg shadow border dark:border-gray-700"
            >
              <div className="flex items-center space-x-3">
                <File className="h-5 w-5 text-gray-400" />
                <span className="text-gray-900 dark:text-white">{file.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleFileSelection(file)}
                  className="p-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900"
                  title="View SQL"
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onExecute(file.content)}
                  className="p-2 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 rounded-full hover:bg-green-50 dark:hover:bg-green-900"
                  title="Execute SQL"
                >
                  <Play className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onDelete(file.id)}
                  className="p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 rounded-full hover:bg-red-50 dark:hover:bg-red-900"
                  title="Delete file"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}

          {selectedFile && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border dark:border-gray-700">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  SQL Content: {selectedFile.name}
                </h4>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  title="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <pre className="p-4 bg-white dark:bg-gray-900 rounded border dark:border-gray-700 overflow-x-auto text-sm text-gray-900 dark:text-white">
                <code>{selectedFile.content}</code>
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

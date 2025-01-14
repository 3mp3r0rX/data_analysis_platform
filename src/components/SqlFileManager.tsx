import React from 'react';
import { File, Play, Trash2, Eye } from 'lucide-react';

interface SqlFile {
  id: string;
  name: string;
  content: string;
}

interface SqlFileManagerProps {
  files: SqlFile[];
  onExecute: (content: string) => void;
  onDelete: (id: string) => void;
}

export const SqlFileManager: React.FC<SqlFileManagerProps> = ({
  files,
  onExecute,
  onDelete,
}) => {
  const [selectedFile, setSelectedFile] = React.useState<SqlFile | null>(null);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">SQL Files</h3>
      {files.length === 0 ? (
        <p className="text-gray-500">No SQL files uploaded yet. Upload a .sql file to get started.</p>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border"
              >
                <div className="flex items-center space-x-3">
                  <File className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-900">{file.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedFile(selectedFile?.id === file.id ? null : file)}
                    className="p-2 text-blue-600 hover:text-blue-700 rounded-full hover:bg-blue-50"
                    title="View SQL"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onExecute(file.content)}
                    className="p-2 text-green-600 hover:text-green-700 rounded-full hover:bg-green-50"
                    title="Execute SQL"
                  >
                    <Play className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDelete(file.id)}
                    className="p-2 text-red-600 hover:text-red-700 rounded-full hover:bg-red-50"
                    title="Delete file"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {selectedFile && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-gray-900">SQL Content: {selectedFile.name}</h4>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Close
                </button>
              </div>
              <pre className="p-4 bg-white rounded border overflow-x-auto">
                <code className="text-sm">{selectedFile.content}</code>
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
import React from 'react';
import Editor from '@monaco-editor/react';
import { Play } from 'lucide-react';

interface CodeEditorProps {
  language: 'python' | 'sql' | 'javascript';
  value: string;
  onChange: (value: string | undefined) => void;
  onRun: () => void;
  height?: string;
  theme?: 'light' | 'dark'; 
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  language = 'javascript', 
  value,
  onChange,
  onRun,
  height = '300px',
  theme = 'light', 
}) => {
  return (
    <div className="border rounded-lg overflow-hidden shadow">
      {/* Header with language display and "Run" button */}
      <div className="bg-gray-100 px-4 py-2 flex justify-between items-center border-b">
        <span className="text-sm font-medium text-gray-700 capitalize">
          {language} Editor
        </span>
        <button
          onClick={onRun}
          aria-label={`Run ${language} code`}
          className="flex items-center px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400"
        >
          <Play className="h-4 w-4 mr-1" />
          Run
        </button>
      </div>

      {/* Code editor */}
      <Editor
        height={height}
        defaultLanguage={language}
        value={value}
        onChange={onChange}
        theme={theme === 'dark' ? 'vs-dark' : 'vs-light'} 
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          wordWrap: 'on', 
        }}
      />
    </div>
  );
};

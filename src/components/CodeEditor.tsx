import React from 'react';
import Editor from '@monaco-editor/react';
import { Play } from 'lucide-react';

interface CodeEditorProps {
  language: 'python' | 'sql' | 'javascript';
  value: string;
  onChange: (value: string | undefined) => void;
  onRun: () => void;
  height?: string;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  language,
  value,
  onChange,
  onRun,
  height = '300px'
}) => {
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-gray-100 px-4 py-2 flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700 capitalize">{language} Editor</span>
        <button
          onClick={onRun}
          className="flex items-center px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
        >
          <Play className="h-4 w-4 mr-1" />
          Run
        </button>
      </div>
      <Editor
        height={height}
        defaultLanguage={language}
        value={value}
        onChange={onChange}
        theme="vs-light"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
        }}
      />
    </div>
  );
};
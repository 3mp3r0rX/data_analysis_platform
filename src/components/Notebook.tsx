import React, { useState, useCallback, useMemo } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Plus, Trash2, Type, Code as CodeIcon, ChevronUp, ChevronDown, Loader } from 'lucide-react';
import { Resizable } from 're-resizable';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';

interface Cell {
  id: string;
  type: 'code' | 'markdown';
  content: string;
  output?: string;
  status?: 'idle' | 'running' | 'success' | 'error';
  height?: number;
}

export const Notebook: React.FC = () => {
  const [cells, setCells] = useState<Cell[]>(() => {
    const savedCells = localStorage.getItem('notebook-cells');
    return savedCells ? JSON.parse(savedCells) : [
      { 
        id: '1', 
        type: 'markdown', 
        content: '# Data Analysis Notebook\nUse this notebook to analyze your data with Python-like syntax.',
        height: 100
      },
      {
        id: '2',
        type: 'code',
        content: '// Access your data with the "data" variable\nconst summary = {\n  count: data.length,\n  columns: Object.keys(data[0] || {})\n};\nconsole.log("Data Summary:", summary);',
        height: 150
      }
    ];
  });

  const saveCells = useCallback((newCells: Cell[]) => {
    setCells(newCells);
    localStorage.setItem('notebook-cells', JSON.stringify(newCells));
  }, []);

  const addCell = useCallback((type: 'code' | 'markdown', index: number) => {
    const newCell: Cell = {
      id: Date.now().toString(),
      type,
      content: type === 'code' ? '// Your code here' : '# Your markdown here',
      height: 100
    };
    const newCells = [...cells];
    newCells.splice(index + 1, 0, newCell);
    saveCells(newCells);
  }, [cells, saveCells]);

  const deleteCell = useCallback((index: number) => {
    saveCells(cells.filter((_, i) => i !== index));
  }, [cells, saveCells]);

  const moveCell = useCallback((index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === cells.length - 1)
    ) return;

    const newCells = [...cells];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newCells[index], newCells[newIndex]] = [newCells[newIndex], newCells[index]];
    saveCells(newCells);
  }, [cells, saveCells]);

  const updateCell = useCallback((index: number, content: string) => {
    const newCells = [...cells];
    newCells[index] = { ...newCells[index], content };
    saveCells(newCells);
  }, [cells, saveCells]);

  const toggleCellType = useCallback((index: number) => {
    const newCells = [...cells];
    newCells[index] = {
      ...newCells[index],
      type: newCells[index].type === 'code' ? 'markdown' : 'code',
      output: undefined,
      status: 'idle'
    };
    saveCells(newCells);
  }, [cells, saveCells]);

  const executeCell = useCallback(async (index: number) => {
    const cell = cells[index];
    if (cell.type !== 'code') return;

    const newCells = [...cells];
    newCells[index] = { ...cell, status: 'running', output: undefined };
    saveCells(newCells);

    try {
      const logs: string[] = [];
      const originalConsoleLog = console.log;
      console.log = (...args) => {
        logs.push(args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' '));
      };

      const result = new Function('data', cell.content)(window.data);
      
      console.log = originalConsoleLog;

      newCells[index] = {
        ...cell,
        status: 'success',
        output: logs.join('\n') + (result !== undefined ? '\n' + String(result) : '')
      };
    } catch (error) {
      newCells[index] = {
        ...cell,
        status: 'error',
        output: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
    saveCells(newCells);
  }, [cells, saveCells]);

  const handleResizeStop = useCallback((index: number, e, direction, ref) => {
    const newHeight = parseInt(ref.style.height) || 100;
    const newCells = [...cells];
    newCells[index] = { ...newCells[index], height: newHeight };
    saveCells(newCells);
  }, [cells, saveCells]);

  const editorTheme = useMemo(() => ({
    base: 'vs-dark',
    inherit: true,
    rules: [],
    colors: { 'editor.background': '#1e1e1e' }
  }), []);

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      {cells.map((cell, index) => (
        <div key={cell.id} className="group relative">
          <div className="absolute -left-10 top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => moveCell(index, 'up')}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={index === 0}
            >
              <ChevronUp className="h-4 w-4 text-gray-500" />
            </button>
            <button
              onClick={() => moveCell(index, 'down')}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={index === cells.length - 1}
            >
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </button>
          </div>
          
          <Resizable
            size={{ height: cell.height || 100, width: '100%' }}
            minHeight={80}
            enable={{ bottom: true }}
            onResizeStop={(e, dir, ref) => handleResizeStop(index, e, dir, ref)}
            className="border rounded-xl overflow-hidden bg-[#1e1e1e] shadow-lg"
          >
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between bg-gray-900 px-4 py-2">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleCellType(index)}
                    className="p-1.5 hover:bg-gray-800 rounded-lg transition-colors"
                    title={`Switch to ${cell.type === 'code' ? 'markdown' : 'code'}`}
                  >
                    {cell.type === 'code' ? (
                      <CodeIcon className="h-4 w-4 text-blue-400" />
                    ) : (
                      <Type className="h-4 w-4 text-purple-400" />
                    )}
                  </button>
                  {cell.type === 'code' && (
                    <button
                      onClick={() => executeCell(index)}
                      className="p-1.5 hover:bg-gray-800 rounded-lg transition-colors"
                      title="Run cell (Ctrl+Enter)"
                    >
                      {cell.status === 'running' ? (
                        <Loader className="h-4 w-4 text-green-400 animate-spin" />
                      ) : (
                        <Play className="h-4 w-4 text-green-400" />
                      )}
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => addCell('code', index)}
                    className="p-1.5 hover:bg-gray-800 rounded-lg transition-colors"
                    title="Add code cell"
                  >
                    <Plus className="h-4 w-4 text-gray-400" />
                  </button>
                  <button
                    onClick={() => deleteCell(index)}
                    className="p-1.5 hover:bg-red-900/50 rounded-lg transition-colors"
                    title="Delete cell"
                  >
                    <Trash2 className="h-4 w-4 text-red-400" />
                  </button>
                </div>
              </div>
              
              <Editor
                height="100%"
                theme="vs-dark"
                defaultLanguage={cell.type === 'code' ? 'javascript' : 'markdown'}
                value={cell.content}
                onChange={(value) => updateCell(index, value || '')}
                options={{
                  minimap: { enabled: false },
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  wordWrap: 'on',
                  fontSize: 14,
                  roundedSelection: false,
                  padding: { top: 8 },
                  contextmenu: false,
                  automaticLayout: true,
                }}
                beforeMount={monaco => monaco.editor.defineTheme('notebook-theme', editorTheme)}
              />
            </div>
          </Resizable>

          {cell.output && (
            <div className="mt-2 border rounded-lg overflow-hidden bg-gray-900">
              <div className="px-4 py-2 bg-gray-800 text-sm font-mono text-gray-400">
                Output {cell.status === 'error' && '(Error)'}
              </div>
              <SyntaxHighlighter
                language="javascript"
                style={vscDarkPlus}
                customStyle={{
                  padding: '1rem',
                  margin: 0,
                  background: '#1e1e1e',
                  borderRadius: 0
                }}
              >
                {cell.output}
              </SyntaxHighlighter>
            </div>
          )}
        </div>
      ))}

      <div className="fixed bottom-8 right-8">
        <button
          onClick={() => addCell('code', cells.length - 1)}
          className="p-3 bg-blue-600 hover:bg-blue-700 rounded-full shadow-lg transition-all"
        >
          <Plus className="h-6 w-6 text-white" />
        </button>
      </div>
    </div>
  );
};
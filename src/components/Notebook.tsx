import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Plus, Trash2, Type, Code as CodeIcon, ChevronUp, ChevronDown } from 'lucide-react';

interface Cell {
  id: string;
  type: 'code' | 'markdown';
  content: string;
  output?: string;
}

export const Notebook: React.FC = () => {
  const [cells, setCells] = useState<Cell[]>([
    { 
      id: '1', 
      type: 'markdown', 
      content: '# Data Analysis Notebook\nUse this notebook to analyze your data with Python-like syntax.' 
    },
    {
      id: '2',
      type: 'code',
      content: '// Access your data with the "data" variable\nconst summary = {\n  count: data.length,\n  columns: Object.keys(data[0] || {})\n};\nconsole.log("Data Summary:", summary);',
    }
  ]);

  const addCell = (type: 'code' | 'markdown', index: number) => {
    const newCell: Cell = {
      id: Date.now().toString(),
      type,
      content: type === 'code' ? '// Your code here' : '# Your markdown here'
    };
    const newCells = [...cells];
    newCells.splice(index + 1, 0, newCell);
    setCells(newCells);
  };

  const deleteCell = (index: number) => {
    setCells(cells.filter((_, i) => i !== index));
  };

  const moveCell = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === cells.length - 1)
    ) {
      return;
    }

    const newCells = [...cells];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newCells[index], newCells[newIndex]] = [newCells[newIndex], newCells[index]];
    setCells(newCells);
  };

  const updateCell = (index: number, content: string) => {
    const newCells = [...cells];
    newCells[index] = { ...newCells[index], content };
    setCells(newCells);
  };

  const toggleCellType = (index: number) => {
    const newCells = [...cells];
    newCells[index] = {
      ...newCells[index],
      type: newCells[index].type === 'code' ? 'markdown' : 'code'
    };
    setCells(newCells);
  };

  const executeCell = async (index: number) => {
    const cell = cells[index];
    if (cell.type !== 'code') return;

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

      const newCells = [...cells];
      newCells[index] = {
        ...cell,
        output: logs.join('\n') + (result !== undefined ? '\n' + String(result) : '')
      };
      setCells(newCells);
    } catch (error) {
      const newCells = [...cells];
      newCells[index] = {
        ...cell,
        output: `Error: ${error.message}`
      };
      setCells(newCells);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      {cells.map((cell, index) => (
        <div key={cell.id} className="group relative">
          <div className="absolute -left-12 top-0 flex flex-col opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => moveCell(index, 'up')}
              className="p-1 hover:text-blue-500"
              disabled={index === 0}
            >
              <ChevronUp className="h-4 w-4" />
            </button>
            <button
              onClick={() => moveCell(index, 'down')}
              className="p-1 hover:text-blue-500"
              disabled={index === cells.length - 1}
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
          
          <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
            <div className="flex items-center justify-between bg-gray-50 px-4 py-2">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => toggleCellType(index)}
                  className="p-1 hover:text-blue-500"
                  title={`Switch to ${cell.type === 'code' ? 'markdown' : 'code'}`}
                >
                  {cell.type === 'code' ? <CodeIcon className="h-4 w-4" /> : <Type className="h-4 w-4" />}
                </button>
                {cell.type === 'code' && (
                  <button
                    onClick={() => executeCell(index)}
                    className="p-1 hover:text-green-500"
                    title="Run cell"
                  >
                    <Play className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => addCell('code', index)}
                  className="p-1 hover:text-blue-500"
                  title="Add cell"
                >
                  <Plus className="h-4 w-4" />
                </button>
                <button
                  onClick={() => deleteCell(index)}
                  className="p-1 hover:text-red-500"
                  title="Delete cell"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="border-t">
              <Editor
                height="100px"
                defaultLanguage={cell.type === 'code' ? 'javascript' : 'markdown'}
                value={cell.content}
                onChange={(value) => updateCell(index, value || '')}
                options={{
                  minimap: { enabled: false },
                  lineNumbers: 'off',
                  scrollBeyondLastLine: false,
                  wordWrap: 'on'
                }}
              />
            </div>
            
            {cell.output && (
              <div className="border-t bg-gray-50 p-4">
                <pre className="whitespace-pre-wrap text-sm">{cell.output}</pre>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
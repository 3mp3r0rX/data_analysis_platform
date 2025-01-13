import { useState, useCallback } from 'react';
import { FileUpload } from './components/FileUpload';
import { DataTable } from './components/DataTable';
import { AnalysisPanel } from './components/AnalysisPanel';
import { DataEditor } from './components/DataEditor';
import { CodeEditor } from './components/CodeEditor';
import { Visualizations } from './components/Visualizations';
import { Notebook } from './components/Notebook';
import { DataRow, AnalysisResult } from './types';
import { analyzeColumn } from './utils/analysis';
import { parse } from 'papaparse';
import { LayoutDashboard, Table, BarChart, Edit3, Code, LineChart, Download, Share2, BookOpen } from 'lucide-react';
import initSqlJs from 'sql.js-httpvfs';

declare global {
  interface Window {
    data: DataRow[];
    sqlOutput: string;
    pythonOutput: string;
    jsOutput: string;
  }
}

function App() {
  const [data, setData] = useState<DataRow[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);
  const [activeTab, setActiveTab] = useState<'data' | 'analysis' | 'edit' | 'code' | 'visualize' | 'notebook'>('data');
  const [sqlQuery, setSqlQuery] = useState("SELECT * FROM data LIMIT 10;");
  const [pythonCode, setPythonCode] = useState(`import pandas as pd\nimport numpy as np\n\n# Your data is available as 'df'\n`);
  const [jsCode, setJsCode] = useState(`// Your data is available as 'data'\n`);
  const [codeOutput, setCodeOutput] = useState<{sql: string; python: string; js: string}>({
    sql: '',
    python: '',
    js: ''
  });

  const handleFileUpload = useCallback((file: File) => {
    parse(file, {
      header: true,
      complete: (results) => {
        const parsedData = results.data as DataRow[];
        setData(parsedData);
        window.data = parsedData;
        if (parsedData.length > 0) {
          setColumns(Object.keys(parsedData[0]));
          const analysis = Object.keys(parsedData[0]).map(column =>
            analyzeColumn(parsedData, column)
          );
          setAnalysisResults(analysis);
        }
      },
    });
  }, []);

  const executeSQL = async () => {
    try {
      const SQL = await initSqlJs({
        locateFile: (file: any) => `https://sql.js.org/dist/${file}`
      });
      
      const db = new SQL.Database();
      
      // Create table and insert data
      const createTable = `CREATE TABLE data (${columns.map((col: any) => `${col} TEXT`).join(', ')});`;
      db.run(createTable);
      
      const insertData = data.map(row => {
        const values = columns.map((col: string | number) => {
          const val = row[col];
          return typeof val === 'string' ? `'${val.replace(/'/g, "''")}'` : val;
        });
        return `INSERT INTO data VALUES (${values.join(', ')});`;
      });
      
      insertData.forEach(query => db.run(query));
      
      // Execute user query
      const result = db.exec(sqlQuery);
      
      if (result.length === 0) {
        setCodeOutput(prev => ({...prev, sql: 'Query executed successfully (no results)'}));
        return;
      }
      
      const columns = result[0].columns;
      const values = result[0].values;
      const output = [
        columns.join('\t'),
        ...values.map((row: any[]) => row.join('\t'))
      ].join('\n');
      
      setCodeOutput(prev => ({...prev, sql: output}));
    } catch (error) {
      setCodeOutput(prev => ({...prev, sql: `Error: ${error.message}`}));
    }
  };

  const executeJavaScript = () => {
    try {
      const logs: string[] = [];
      const originalConsoleLog = console.log;
      console.log = (...args) => {
        logs.push(args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' '));
      };

      const result = new Function('data', jsCode)(data);
      console.log = originalConsoleLog;

      setCodeOutput(prev => ({
        ...prev, 
        js: logs.join('\n') + (result !== undefined ? '\n' + String(result) : '')
      }));
    } catch (error) {
      setCodeOutput(prev => ({...prev, js: `Error: ${error.message}`}));
    }
  };

  const executePython = () => {
    setCodeOutput(prev => ({
      ...prev,
      python: 'Python execution is not available in the browser environment. Consider using the JavaScript editor instead.'
    }));
  };

  const handleDataSave = (newData: DataRow[]) => {
    setData(newData);
    const analysis = columns.map(column => analyzeColumn(newData, column));
    setAnalysisResults(analysis);
  };

  const handleExportData = () => {
    const csvContent = [
      columns.join(','),
      ...data.map(row => columns.map(col => `"${row[col]}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'analyzed_data.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShareAnalysis = () => {
    const analysisReport = {
      data: data.slice(0, 100),
      analysis: analysisResults,
      timestamp: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(analysisReport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'analysis_report.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getTabClassName = (tab: string) => `
    ${activeTab === tab
      ? 'border-blue-500 text-blue-600'
      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
    } flex items-center px-6 py-4 border-b-2 font-medium text-sm
  `;

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <LayoutDashboard className="h-6 w-6 text-blue-500" />
              <span className="ml-2 text-xl font-semibold">Data Analysis Platform</span>
            </div>
            {data.length > 0 && (
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleExportData}
                  className="flex items-center px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </button>
                <button
                  onClick={handleShareAnalysis}
                  className="flex items-center px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Analysis
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {data.length === 0 ? (
          <div className="max-w-xl mx-auto">
            <FileUpload onFileUpload={handleFileUpload} />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg">
              <div className="border-b border-gray-200">
                <nav className="flex -mb-px">
                  <button
                    onClick={() => setActiveTab('data')}
                    className={getTabClassName('data')}
                  >
                    <Table className="h-5 w-5 mr-2" />
                    Data View
                  </button>
                  <button
                    onClick={() => setActiveTab('analysis')}
                    className={getTabClassName('analysis')}
                  >
                    <BarChart className="h-5 w-5 mr-2" />
                    Analysis
                  </button>
                  <button
                    onClick={() => setActiveTab('visualize')}
                    className={getTabClassName('visualize')}
                  >
                    <LineChart className="h-5 w-5 mr-2" />
                    Visualize
                  </button>
                  <button
                    onClick={() => setActiveTab('edit')}
                    className={getTabClassName('edit')}
                  >
                    <Edit3 className="h-5 w-5 mr-2" />
                    Edit Data
                  </button>
                  <button
                    onClick={() => setActiveTab('code')}
                    className={getTabClassName('code')}
                  >
                    <Code className="h-5 w-5 mr-2" />
                    Code
                  </button>
                  <button
                    onClick={() => setActiveTab('notebook')}
                    className={getTabClassName('notebook')}
                  >
                    <BookOpen className="h-5 w-5 mr-2" />
                    Notebook
                  </button>
                </nav>
              </div>
              <div className="p-6">
                {activeTab === 'data' && (
                  <DataTable data={data} columns={columns} />
                )}
                {activeTab === 'analysis' && (
                  <AnalysisPanel results={analysisResults} />
                )}
                {activeTab === 'visualize' && (
                  <Visualizations data={data} columns={columns} />
                )}
                {activeTab === 'edit' && (
                  <DataEditor
                    data={data}
                    columns={columns}
                    onSave={handleDataSave}
                  />
                )}
                {activeTab === 'code' && (
                  <div className="space-y-6">
                    <div>
                      <CodeEditor
                        language="sql"
                        value={sqlQuery}
                        onChange={setSqlQuery}
                        onRun={executeSQL}
                      />
                      {codeOutput.sql && (
                        <div className="mt-2 p-4 bg-gray-50 rounded border">
                          <pre className="whitespace-pre-wrap">{codeOutput.sql}</pre>
                        </div>
                      )}
                    </div>
                    <div>
                      <CodeEditor
                        language="python"
                        value={pythonCode}
                        onChange={setPythonCode}
                        onRun={executePython}
                      />
                      {codeOutput.python && (
                        <div className="mt-2 p-4 bg-gray-50 rounded border">
                          <pre className="whitespace-pre-wrap">{codeOutput.python}</pre>
                        </div>
                      )}
                    </div>
                    <div>
                      <CodeEditor
                        language="javascript"
                        value={jsCode}
                        onChange={setJsCode}
                        onRun={executeJavaScript}
                      />
                      {codeOutput.js && (
                        <div className="mt-2 p-4 bg-gray-50 rounded border">
                          <pre className="whitespace-pre-wrap">{codeOutput.js}</pre>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {activeTab === 'notebook' && <Notebook />}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
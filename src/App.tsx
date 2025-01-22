import React, { useState, useCallback } from 'react';
import { FileUpload } from './components/FileUpload';
import { DataTable } from './components/DataTable';
import { AnalysisPanel } from './components/AnalysisPanel';
import { DataEditor } from './components/DataEditor';
import { Visualizations } from './components/Visualizations';
import { Notebook } from './components/Notebook';
import { SqlFileManager } from './components/SqlFileManager';
import { DataCuration } from './components/DataCuration';
import { Dashboard } from './components/Dashboard';
import { DataRow, AnalysisResult } from './types';
import { analyzeColumn } from './utils/analysis';
import { parse } from 'papaparse';
import { LayoutDashboard, Table, BarChart, Edit3, LineChart, Download, Share2, BookOpen, Database, Play, Wand2 } from 'lucide-react';
import initSqlJs from 'sql.js-httpvfs';

interface SqlFile {
  id: string;
  name: string;
  content: string;
}

interface SqliteDb {
  name: string;
  db: any;
}

const initializeSqlJs = async () => {
  try {
    const SQL = await initSqlJs({
      locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
    });
    return SQL;
  } catch (error) {
    console.error('Error initializing SQL.js:', error);
    throw error;
  }
};

export default function App() {
  const [data, setData] = useState<DataRow[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);
  const [activeTab, setActiveTab] = useState<'data' | 'analysis' | 'edit' | 'sql' | 'visualize' | 'notebook' | 'curate' | 'dashboard'>('data');
  const [sqlQuery, setSqlQuery] = useState("SELECT * FROM sqlite_master WHERE type='table';");
  const [sqlOutput, setSqlOutput] = useState('');
  const [sqlFiles, setSqlFiles] = useState<SqlFile[]>([]);
  const [sqliteDb, setSqliteDb] = useState<SqliteDb | null>(null);
  const [isExecutingSql, setIsExecutingSql] = useState(false);

  const handleFileUpload = useCallback((file: File) => {
    parse(file, {
      header: true,
      dynamicTyping: true,
      complete: (results) => {
        const parsedData = results.data as DataRow[];
        if (parsedData.length > 0) {
          setData(parsedData);
          setColumns(Object.keys(parsedData[0]));
          // Analyze each column
          const analysis = Object.keys(parsedData[0]).map(column => 
            analyzeColumn(parsedData, column)
          );
          setAnalysisResults(analysis);
        }
      },
      error: (error) => {
        console.error('Error parsing CSV:', error);
        alert('Error parsing the CSV file. Please check the file format.');
      }
    });
  }, []);

  const handleSqlFileUpload = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setSqlFiles(prev => [...prev, {
        id: Date.now().toString(),
        name: file.name,
        content
      }]);
    };
    reader.readAsText(file);
  }, []);

  const handleSqliteFileUpload = useCallback(async (file: File) => {
    try {
      const SQL = await initializeSqlJs();
      const buffer = await file.arrayBuffer();
      const db = new SQL.Database(new Uint8Array(buffer));
      setSqliteDb({ name: file.name, db });
    } catch (error) {
      console.error('Error loading SQLite database:', error);
      alert('Error loading the SQLite database. Please check the file format.');
    }
  }, []);

  const handleDataSave = useCallback((newData: DataRow[]) => {
    setData(newData);
    // Re-analyze data after changes
    if (newData.length > 0) {
      const analysis = Object.keys(newData[0]).map(column => 
        analyzeColumn(newData, column)
      );
      setAnalysisResults(analysis);
    }
  }, []);

  const handleSqlFileExecute = useCallback((content: string) => {
    setSqlQuery(content);
    executeSQL();
  }, []);

  const handleSqlFileDelete = useCallback((id: string) => {
    setSqlFiles(prev => prev.filter(file => file.id !== id));
  }, []);

  const executeSQL = useCallback(async () => {
    if (!sqliteDb?.db) {
      alert('Please load a SQLite database first.');
      return;
    }

    setIsExecutingSql(true);
    try {
      const results = sqliteDb.db.exec(sqlQuery);
      setSqlOutput(JSON.stringify(results, null, 2));
    } catch (error) {
      console.error('SQL execution error:', error);
      setSqlOutput(`Error: ${error.message}`);
    } finally {
      setIsExecutingSql(false);
    }
  }, [sqlQuery, sqliteDb]);

  const handleExportData = useCallback(() => {
    const headers = columns.join(',');
    const rows = data.map(row => 
      columns.map(col => `"${row[col]}"`).join(',')
    ).join('\n');
    const csv = `${headers}\n${rows}`;
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'exported_data.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, [data, columns]);

  const handleShareAnalysis = useCallback(() => {
    const analysisText = analysisResults.map(result => {
      const basic = `Column: ${result.columnName}
Type: ${result.type}
Count: ${result.count}`;
      
      const numeric = result.type === 'numeric' ? `
Mean: ${result.mean?.toFixed(2)}
Median: ${result.median?.toFixed(2)}
Min: ${result.min?.toFixed(2)}
Max: ${result.max?.toFixed(2)}
Standard Deviation: ${result.standardDeviation?.toFixed(2)}
Q1: ${result.quartiles?.q1.toFixed(2)}
Q3: ${result.quartiles?.q3.toFixed(2)}` : '';

      const categorical = result.type === 'categorical' ? `
Mode: ${result.mode}` : '';

      return `${basic}${numeric}${categorical}\n`;
    }).join('\n---\n\n');

    const blob = new Blob([analysisText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'analysis_results.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, [analysisResults]);

  const getTabClassName = (tab: string) => {
    const baseClasses = "flex items-center px-4 py-2 border-b-2 text-sm font-medium";
    return activeTab === tab
      ? `${baseClasses} border-blue-500 text-blue-600`
      : `${baseClasses} border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300`;
  };

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
        {data.length === 0 && !sqliteDb ? (
          <div className="max-w-xl mx-auto">
            <FileUpload 
              onFileUpload={handleFileUpload}
              onSqlFileUpload={handleSqlFileUpload}
              onSqliteFileUpload={handleSqliteFileUpload}
            />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg">
              <div className="border-b border-gray-200">
                <nav className="flex -mb-px">
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className={getTabClassName('dashboard')}
                  >
                    <LayoutDashboard className="h-5 w-5 mr-2" />
                    Dashboard
                  </button>
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
                    onClick={() => setActiveTab('curate')}
                    className={getTabClassName('curate')}
                  >
                    <Wand2 className="h-5 w-5 mr-2" />
                    Curate
                  </button>
                  <button
                    onClick={() => setActiveTab('sql')}
                    className={getTabClassName('sql')}
                  >
                    <Database className="h-5 w-5 mr-2" />
                    SQL
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
                {activeTab === 'dashboard' && (
                  <Dashboard 
                    data={data}
                    columns={columns}
                    analysisResults={analysisResults}
                  />
                )}
                {activeTab === 'data' && data.length > 0 && (
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
                {activeTab === 'curate' && (
                  <DataCuration
                    data={data}
                    columns={columns}
                    onSave={handleDataSave}
                  />
                )}
                {activeTab === 'sql' && (
                  <div className="space-y-6">
                    {sqliteDb && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <h3 className="text-blue-800 font-medium">
                          Working with SQLite database: {sqliteDb.name}
                        </h3>
                      </div>
                    )}
                    <SqlFileManager
                      files={sqlFiles}
                      onExecute={handleSqlFileExecute}
                      onDelete={handleSqlFileDelete}
                    />
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium text-gray-900">SQL Query</h3>
                        <button
                          onClick={executeSQL}
                          disabled={isExecutingSql}
                          className="flex items-center px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Run Query
                        </button>
                      </div>
                      <textarea
                        value={sqlQuery}
                        onChange={(e) => setSqlQuery(e.target.value)}
                        className="w-full h-40 font-mono text-sm p-4 border rounded-lg"
                        placeholder="Enter your SQL query here..."
                      />
                      {sqlOutput && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg border overflow-x-auto">
                          <pre className="whitespace-pre-wrap font-mono text-sm">{sqlOutput}</pre>
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
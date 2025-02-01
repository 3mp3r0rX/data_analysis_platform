import React, { useState, useCallback, useEffect } from 'react';
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
import { 
  LayoutDashboard, 
  Table, 
  BarChart, 
  Edit3, 
  LineChart, 
  Download, 
  Share2, 
  BookOpen, 
  Database, 
  Play, 
  Wand2,
  Settings,
  HelpCircle,
  Bell
} from 'lucide-react';
import initSqlJs from 'sql.js-httpvfs';
import { LandingPage } from './components/LandingPage';

interface SqlFile {
  id: string;
  name: string;
  content: string;
}

interface SqliteDb {
  name: string;
  db: any;
}

interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  timestamp: Date;
}

const initializeSqlJs = async () => {
  try {
    const SQL = await initSqlJs({
      locateFile: (file: any) => `https://sql.js.org/dist/1.8.0/${file}`
    });
    return SQL;
  } catch (error) {
    console.error('Error initializing SQL.js:', error);
    throw error;
  }
};

export default function App() {
  const [showFileUpload, setShowFileUpload] = useState(false)
  const [data, setData] = useState<DataRow[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);
  const [activeTab, setActiveTab] = useState<'data' | 'analysis' | 'edit' | 'sql' | 'visualize' | 'notebook' | 'curate' | 'dashboard'>('dashboard');
  const [sqlQuery, setSqlQuery] = useState("SELECT * FROM sqlite_master WHERE type='table';");
  const [sqlOutput, setSqlOutput] = useState('');
  const [sqlFiles, setSqlFiles] = useState<SqlFile[]>([]);
  const [sqliteDb, setSqliteDb] = useState<SqliteDb | null>(null);
  const [isExecutingSql, setIsExecutingSql] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const darkMode = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(darkMode);
    if (darkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('darkMode', String(newMode));
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const addNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const newNotification = {
      id: Date.now().toString(),
      message,
      type,
      timestamp: new Date()
    };
    setNotifications(prev => [newNotification, ...prev].slice(0, 5));
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleFileUpload = useCallback((file: File) => {
    parse(file, {
      header: true,
      dynamicTyping: true,
      complete: (results) => {
        const parsedData = results.data as DataRow[];
        if (parsedData.length > 0) {
          setData(parsedData);
          setColumns(Object.keys(parsedData[0]));
          const analysis = Object.keys(parsedData[0]).map(column => 
            analyzeColumn(parsedData, column)
          );
          setAnalysisResults(analysis);
          addNotification(`Successfully loaded ${parsedData.length} rows of data`, 'success');
        }
      },
      error: (error) => {
        console.error('Error parsing CSV:', error);
        addNotification('Error parsing the CSV file. Please check the file format.', 'error');
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
      addNotification(`SQL file "${file.name}" uploaded successfully`, 'success');
    };
    reader.readAsText(file);
  }, []);

  const handleSqliteFileUpload = useCallback(async (file: File) => {
    try {
      const SQL = await initializeSqlJs();
      if (!SQL) {
        throw new Error('Failed to initialize SQL.js');
      }

      const buffer = await file.arrayBuffer();
      if (!buffer) {
        throw new Error('Failed to read file');
      }

      const db = new SQL.Database(new Uint8Array(buffer));
      if (!db) {
        throw new Error('Failed to create database');
      }

      try {
        db.exec("SELECT 1");
      } catch (e) {
        throw new Error('Invalid SQLite database file');
      }

      setSqliteDb({ name: file.name, db });
      addNotification(`SQLite database "${file.name}" loaded successfully`, 'success');
    } catch (error) {
      console.error('Error loading SQLite database:', error);
      addNotification(error.message || 'Error loading the SQLite database', 'error');
    }
  }, []);

  const handleDataSave = useCallback((newData: DataRow[]) => {
    setData(newData);
    if (newData.length > 0) {
      const analysis = Object.keys(newData[0]).map(column => 
        analyzeColumn(newData, column)
      );
      setAnalysisResults(analysis);
      addNotification('Data changes saved successfully', 'success');
    }
  }, []);

  const handleSqlFileExecute = useCallback((content: string) => {
    setSqlQuery(content);
    executeSQL();
  }, []);

  const handleSqlFileDelete = useCallback((id: string) => {
    setSqlFiles(prev => prev.filter(file => file.id !== id));
    addNotification('SQL file deleted', 'info');
  }, []);

  const executeSQL = useCallback(async () => {
    if (!sqliteDb?.db) {
      addNotification('Please load a SQLite database first.', 'error');
      return;
    }

    setIsExecutingSql(true);
    try {
      const results = sqliteDb.db.exec(sqlQuery);
      setSqlOutput(JSON.stringify(results, null, 2));
      addNotification('SQL query executed successfully', 'success');
    } catch (error) {
      console.error('SQL execution error:', error);
      setSqlOutput(`Error: ${error.message}`);
      addNotification(`SQL execution error: ${error.message}`, 'error');
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
    addNotification('Data exported successfully', 'success');
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
    addNotification('Analysis results exported successfully', 'success');
  }, [analysisResults]);

  const getTabClassName = (tab: string) => {
    const baseClasses = "flex items-center px-4 py-2 border-b-2 text-sm font-medium transition-colors duration-200";
    return activeTab === tab
      ? `${baseClasses} border-blue-500 text-blue-600 dark:text-blue-400`
      : `${baseClasses} border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300`;
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-100'}`}>
      <nav className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <LayoutDashboard className="h-6 w-6 text-blue-500 dark:text-blue-400" />
              <span className="ml-2 text-xl font-semibold dark:text-white">Data Analysis Platform</span>
            </div>
            <div className="flex items-center space-x-4">
              {data.length > 0 && (
                <>
                  <button
                    onClick={handleExportData}
                    className="flex items-center px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors duration-200"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </button>
                  <button
                    onClick={handleShareAnalysis}
                    className="flex items-center px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-200"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Analysis
                  </button>
                </>
              )}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 relative"
                >
                  <Bell className="h-5 w-5" />
                  {notifications.length > 0 && (
                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500" />
                  )}
                </button>
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-50">
                    <div className="p-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Notifications</h3>
                      {notifications.length === 0 ? (
                        <p className="text-gray-500 dark:text-gray-400">No notifications</p>
                      ) : (
                        <div className="space-y-4">
                          {notifications.map(notification => (
                            <div
                              key={notification.id}
                              className={`p-3 rounded-lg ${
                                notification.type === 'success' ? 'bg-green-50 dark:bg-green-900' :
                                notification.type === 'error' ? 'bg-red-50 dark:bg-red-900' :
                                'bg-blue-50 dark:bg-blue-900'
                              }`}
                            >
                              <div className="flex justify-between">
                                <p className={`text-sm ${
                                  notification.type === 'success' ? 'text-green-800 dark:text-green-200' :
                                  notification.type === 'error' ? 'text-red-800 dark:text-red-200' :
                                  'text-blue-800 dark:text-blue-200'
                                }`}>
                                  {notification.message}
                                </p>
                                <button
                                  onClick={() => removeNotification(notification.id)}
                                  className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
                                >
                                  ×
                                </button>
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {notification.timestamp.toLocaleTimeString()}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowHelp(!showHelp)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <HelpCircle className="h-5 w-5" />
              </button>
              <button
                onClick={toggleDarkMode}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {showHelp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4">
            <h2 className="text-2xl font-bold mb-4 dark:text-white">Help & Getting Started</h2>
            <div className="space-y-4">
              <section>
                <h3 className="text-lg font-medium mb-2 dark:text-gray-200">Quick Start Guide</h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-400">
                  <li>Upload your data file (CSV, Excel, SQL, or SQLite)</li>
                  <li>Navigate through different views using the tabs</li>
                  <li>Create visualizations and analyze your data</li>
                  <li>Use the dashboard to create custom views</li>
                  <li>Export or share your analysis results</li>
                </ol>
              </section>
              <section>
                <h3 className="text-lg font-medium mb-2 dark:text-gray-200">Features</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
                  <li>Interactive data table with sorting and filtering</li>
                  <li>Statistical analysis and visualizations</li>
                  <li>SQL query interface for database operations</li>
                  <li>Custom dashboard creation</li>
                  <li>Dark mode support</li>
                  <li>Data export and sharing capabilities</li>
                </ul>
              </section>
            </div>
            <button
              onClick={() => setShowHelp(false)}
              className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-200"
            >
              Close Help
            </button>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {data.length === 0 && !sqliteDb ? (
          showFileUpload ? (
          <div className="max-w-xl mx-auto">
            <FileUpload 
              onFileUpload={handleFileUpload}
              onSqlFileUpload={handleSqlFileUpload}
              onSqliteFileUpload={handleSqliteFileUpload}
            />
          </div>
        ) : (
          <LandingPage onGetStarted={() => setShowFileUpload(true)} />
        )
      ) : (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
              <div className="border-b border-gray-200 dark:border-gray-700">
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
                      <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                        <h3 className="text-blue-800 dark:text-blue-200 font-medium">
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
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">SQL Query</h3>
                        <button
                          onClick={executeSQL}
                          disabled={isExecutingSql}
                          className="flex items-center px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 transition-colors duration-200"
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Run Query
                        </button>
                      </div>
                      <textarea
                        value={sqlQuery}
                        onChange={(e) => setSqlQuery(e.target.value)}
                        className="w-full h-40 font-mono text-sm p-4 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600"
                        placeholder="Enter your SQL query here..."
                      />
                      {sqlOutput && (
                        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border dark:border-gray-600 overflow-x-auto">
                          <pre className="whitespace-pre-wrap font-mono text-sm dark:text-white">{sqlOutput}</pre>
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
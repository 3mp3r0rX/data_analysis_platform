import { useState, useCallback } from 'react';
import { FileUpload } from './components/FileUpload';
import { DataTable } from './components/DataTable';
import { AnalysisPanel } from './components/AnalysisPanel';
import { DataEditor } from './components/DataEditor';
import { Visualizations } from './components/Visualizations';
import { Notebook } from './components/Notebook';
import { SqlFileManager } from './components/SqlFileManager';
import { DataRow, AnalysisResult } from './types';
import { analyzeColumn } from './utils/analysis';
import { parse } from 'papaparse';
import { LayoutDashboard, Table, BarChart, Edit3, LineChart, Download, Share2, BookOpen, Database, Play } from 'lucide-react';
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
      locateFile: file => `https://sql.js.org/dist/${file}` 
    });
    return SQL;
  } catch (error) {
    console.error('Error initializing SQL.js:', error);
    throw error;
  }
};

function App() {
  const [data, setData] = useState<DataRow[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);
  const [activeTab, setActiveTab] = useState<'data' | 'analysis' | 'edit' | 'sql' | 'visualize' | 'notebook'>('data');
  const [sqlQuery, setSqlQuery] = useState("SELECT * FROM sqlite_master WHERE type='table';");
  const [sqlOutput, setSqlOutput] = useState('');
  const [sqlFiles, setSqlFiles] = useState<SqlFile[]>([]);
  const [sqliteDb, setSqliteDb] = useState<SqliteDb | null>(null);
  const [isExecutingSql, setIsExecutingSql] = useState(false);
  const [SQL, setSQL] = useState<any>(null); 

  const handleFileUpload = useCallback((file: File) => {
    parse(file, {
      header: true,
      complete: (results) => {
        const parsedData = results.data as DataRow[];
        setData(parsedData);
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

  const handleSqlFileUpload = async (file: File) => {
    const content = await file.text();
    const newFile: SqlFile = {
      id: Date.now().toString(),
      name: file.name,
      content
    };
    setSqlFiles(prev => [...prev, newFile]);
  };

  const handleSqliteFileUpload = async (file: File) => {
    try {
      if (!SQL) {
        const initializedSQL = await initializeSqlJs();
        setSQL(initializedSQL);
      }
      const buffer = await file.arrayBuffer();
      const db = new SQL.Database(new Uint8Array(buffer));
      
      setSqliteDb({ name: file.name, db });
      setActiveTab('sql');
      executeSQL();
    } catch (error) {
      alert('Error loading SQLite database: ' + error.message);
    }
  };

  const handleSqlFileDelete = (id: string) => {
    setSqlFiles(prev => prev.filter(file => file.id !== id));
  };

  const handleSqlFileExecute = (content: string) => {
    setSqlQuery(content);
    executeSQL();
  };

  const executeSQL = async () => {
    setIsExecutingSql(true);
    try {
      const db = sqliteDb?.db || new SQL.Database();
      if (!sqliteDb) {
        // Create table and insert data if db is not from a file
        const createTable = `CREATE TABLE data (${columns.map(col => `${col} TEXT`).join(', ')});`;
        db.run(createTable);

        data.forEach(row => {
          const values = columns.map(col => `'${row[col]?.toString().replace(/'/g, "''")}'`);
          db.run(`INSERT INTO data VALUES (${values.join(', ')});`);
        });
      }

      const results = db.exec(sqlQuery);
      if (results.length === 0) {
        setSqlOutput('Query executed successfully (no results)');
        return;
      }
      
      const fetchedColumns = results[0].columns;
      const values = results[0].values;
      
      const parsedData = values.map(row => {
        const rowData: DataRow = {};
        fetchedColumns.forEach((col, index) => {
          rowData[col] = row[index];
        });
        return rowData;
      });
      
      setData(parsedData);
      setColumns(fetchedColumns);
      
      const output = [
        fetchedColumns.join('\t'),
        ...values.map(row => row.join('\t'))
      ].join('\n');
      
      setSqlOutput(output);
    } catch (error) {
      setSqlOutput(`Error: ${error.message}`);
    } finally {
      setIsExecutingSql(false);
    }
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

export default App;
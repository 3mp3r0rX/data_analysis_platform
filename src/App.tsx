import React, { useState } from 'react';
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
import { LandingPage } from './components/LandingPage';
import { useDarkMode } from './hooks/useDarkMode';
import { useNotifications } from './hooks/useNotifications';
import { useFileHandlers } from './hooks/useFileHandlers';
import { useSqlite } from './hooks/useSqlite';
import { Navbar } from './layout/Navbar';
import { NotificationPanel } from './layout/NotificationPanel';
import { TabNavigation } from './layout/TabNavigation';

const App = () => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { notifications, addNotification, removeNotification } = useNotifications();
  const {
    sqlFiles,
    handleSqlFileUpload,
    handleSqlFileDelete,
    handleSqlFileExecute,
  } = useFileHandlers(addNotification);
  const {
    sqliteDb,
    executeSQL,
    sqlQuery,
    setSqlQuery,
    sqlOutput,
    isExecutingSql,
    handleSqliteFileUpload,
  } = useSqlite(addNotification);

  const [showFileUpload, setShowFileUpload] = useState(false);
  const [data, setData] = useState<DataRow[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'data' | 'analysis' | 'edit' | 'sql' | 'visualize' | 'notebook' | 'curate'
  >('dashboard');

  // Helper function to handle CSV file upload
  const handleFileUpload = (file: File) => {
    parse(file, {
      header: true,
      dynamicTyping: true,
      complete: (results) => {
        const parsedData = results.data as DataRow[];
        if (parsedData.length) {
          setData(parsedData);
          setColumns(Object.keys(parsedData[0]));
          setAnalysisResults(
            Object.keys(parsedData[0]).map((column) =>
              analyzeColumn(parsedData, column)
            )
          );
          addNotification(`Loaded ${parsedData.length} rows`, 'success');
        }
      },
      error: () => addNotification('Error parsing CSV', 'error'),
    });
  };

  // Mapping for dynamic tab rendering
  const tabComponents = {
    dashboard: <Dashboard data={data} columns={columns} analysisResults={analysisResults} />,
    data: <DataTable data={data} columns={columns} />,
    analysis: <AnalysisPanel results={analysisResults} />,
    visualize: <Visualizations data={data} columns={columns} />,
    edit: <DataEditor data={data} columns={columns} onSave={setData} />,
    curate: <DataCuration data={data} columns={columns} onSave={setData} />,
    sql: (
      <SqlFileManager
        files={sqlFiles}
        onExecute={handleSqlFileExecute}
        onDelete={handleSqlFileDelete}
        executeSQL={executeSQL}
        sqlQuery={sqlQuery}
        setSqlQuery={setSqlQuery}
        sqlOutput={sqlOutput}
        isExecutingSql={isExecutingSql}
      />
    ),
    notebook: <Notebook />,
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-100'}`}>
      {/* Navbar */}
      <Navbar toggleDarkMode={toggleDarkMode} notifications={notifications} removeNotification={removeNotification} />

      {/* Notification Panel */}
      <NotificationPanel notifications={notifications} removeNotification={removeNotification} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {data.length === 0 && !sqliteDb ? (
          showFileUpload ? (
            <FileUpload
              onFileUpload={handleFileUpload}
              onSqlFileUpload={handleSqlFileUpload}
              onSqliteFileUpload={handleSqliteFileUpload}
            />
          ) : (
            <LandingPage onGetStarted={() => setShowFileUpload(true)} />
          )
        ) : (
          <div className="space-y-6 bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            {/* Tab Navigation */}
            <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* Render Active Tab */}
            {tabComponents[activeTab]}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
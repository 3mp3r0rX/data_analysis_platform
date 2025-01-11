import  { useState, useCallback, useMemo } from 'react';
import { FileUpload } from './components/FileUpload';
import { DataTable } from './components/DataTable';
import { AnalysisPanel } from './components/AnalysisPanel';
import { DataEditor } from './components/DataEditor';
import { CodeEditor } from './components/CodeEditor';
import { Visualizations } from './components/Visualizations';
import { DataRow, AnalysisResult } from './types';
import { analyzeColumn } from './utils/analysis';
import { parse } from 'papaparse';
import { LayoutDashboard, Table, BarChart, Edit3, Code, LineChart, Download, Share2 } from 'lucide-react';

const App = () => {
  const [data, setData] = useState<DataRow[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);
  const [activeTab, setActiveTab] = useState<
    "data" | "analysis" | "edit" | "code" | "visualize"
  >("data");

  const [code, setCode] = useState({
    sql: "SELECT * FROM data LIMIT 10;",
    python: `import pandas as pd
from sklearn.cluster import KMeans
# Example Python Code`,
    javascript: `// Example JavaScript Code`,
  });

  const handleFileUpload = useCallback((file: File) => {
    parse(file, {
      header: true,
      complete: (results) => {
        const parsedData = results.data as DataRow[];
        setData(parsedData);
        if (parsedData.length > 0) {
          setColumns(Object.keys(parsedData[0]));
          const analysis = Object.keys(parsedData[0]).map((col) =>
            analyzeColumn(parsedData, col)
          );
          setAnalysisResults(analysis);
        }
      },
      error: (err) => {
        console.error("File parsing error:", err);
        alert("Failed to parse file. Please check the format.");
      },
    });
  }, []);

  const handleDataSave = (newData: DataRow[]) => {
    setData(newData);
    const analysis = columns.map((col) => analyzeColumn(newData, col));
    setAnalysisResults(analysis);
  };

  const handleExportData = () => {
    const csvContent = [
      columns.join(","),
      ...data.map((row) =>
        columns.map((col) => `"${row[col] || ""}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "analyzed_data.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShareAnalysis = () => {
    const analysisReport = {
      data: data.slice(0, 100), // Sample of data
      analysis: analysisResults,
      timestamp: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(analysisReport, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "analysis_report.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderTabContent = useMemo(() => {
    switch (activeTab) {
      case "data":
        return <DataTable data={data} columns={columns} />;
      case "analysis":
        return <AnalysisPanel results={analysisResults} />;
      case "visualize":
        return <Visualizations data={data} columns={columns} />;
      case "edit":
        return (
          <DataEditor data={data} columns={columns} onSave={handleDataSave} />
        );
      case "code":
        return (
          <>
            {["sql", "python", "javascript"].map((lang) => (
              <CodeEditor
                key={lang}
                language={lang}
                value={code[lang]}
                onChange={(value) => setCode((prev) => ({ ...prev, [lang]: value }))}
              />
            ))}
          </>
        );
      default:
        return null;
    }
  }, [activeTab, data, columns, analysisResults, code]);

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
                  className="btn-primary flex items-center"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </button>
                <button
                  onClick={handleShareAnalysis}
                  className="btn-primary flex items-center"
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
          <FileUpload onFileUpload={handleFileUpload} />
        ) : (
          <div className="bg-white shadow rounded-lg">
            <nav className="flex border-b">
              {[
                { name: "Data View", icon: Table, tab: "data" },
                { name: "Analysis", icon: BarChart, tab: "analysis" },
                { name: "Visualize", icon: LineChart, tab: "visualize" },
                { name: "Edit Data", icon: Edit3, tab: "edit" },
                { name: "Code", icon: Code, tab: "code" },
              ].map(({ name, icon: Icon, tab }) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`${
                    activeTab === tab
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  } flex items-center px-6 py-4 border-b-2 font-medium text-sm`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {name}
                </button>
              ))}
            </nav>
            <div className="p-6">{renderTabContent}</div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
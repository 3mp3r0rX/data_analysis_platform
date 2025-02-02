import { useState, useCallback } from 'react';
import { parse } from 'papaparse';
import { DataRow, AnalysisResult } from '../types';
import { analyzeColumn } from '../utils/analysis';

export const useFileHandlers = (addNotification: (message: string, type?: "success" | "error" | "info") => void) => {
  const [data, setData] = useState<DataRow[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);
  const [sqlFiles, setSqlFiles] = useState<{ id: string; name: string; content: string }[]>([]);
  const [sqlQuery, setSqlQuery] = useState<string>('');

  // Handle CSV file upload
  const handleFileUpload = useCallback((file: File) => {
    parse(file, {
      header: true,
      dynamicTyping: true,
      complete: (results) => {
        const parsedData = results.data as DataRow[];
        if (parsedData.length > 0) {
          setData(parsedData);
          setColumns(Object.keys(parsedData[0]));
          setAnalysisResults(Object.keys(parsedData[0]).map(column => analyzeColumn(parsedData, column)));
          addNotification(`Successfully loaded ${parsedData.length} rows`, "success");
        }
      },
      error: (error) => {
        console.error('Error parsing CSV:', error);
        addNotification("Error parsing CSV file.", "error");
      }
    });
  }, [addNotification]);

  // Handle SQL file upload
  const handleSqlFileUpload = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setSqlFiles(prevFiles => [...prevFiles, { id: Date.now().toString(), name: file.name, content }]);
      addNotification(`SQL file "${file.name}" uploaded successfully`, "success");
    };
    reader.readAsText(file);
  }, [addNotification]);

  // Handle SQL file delete
  const handleSqlFileDelete = useCallback((id: string) => {
    setSqlFiles(prevFiles => prevFiles.filter(file => file.id !== id));
    addNotification("SQL file deleted successfully", "info");
  }, [addNotification]);

  // Execute SQL query from uploaded file
  const handleSqlFileExecute = useCallback((content: string) => {
    setSqlQuery(content);
    addNotification("SQL query set for execution", "info");
  }, [addNotification]);

  const handleDataSave = useCallback((newData: DataRow[]) => {
    setData(newData);
    if (newData.length > 0) {
      setAnalysisResults(Object.keys(newData[0]).map(column => analyzeColumn(newData, column)));
    }
  }, []);

  return {
    data,
    columns,
    analysisResults,
    sqlFiles,
    sqlQuery,
    handleFileUpload,
    handleSqlFileUpload,
    handleSqlFileDelete,
    handleSqlFileExecute, // ✅ Now returned
    handleDataSave,
    setData,
    setColumns,
    setAnalysisResults,
    setSqlQuery
  };
};

import { useState, useCallback } from 'react';
import { parse } from 'papaparse';
import { DataRow, AnalysisResult } from '../types';
import { analyzeColumn } from '../utils/analysis';

export const useFileHandlers = (addNotification: (message: string, type?: "success" | "error" | "info") => void) => {
  const [data, setData] = useState<DataRow[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);

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
        }
      },
      error: (error) => {
        console.error('Error parsing CSV:', error);
      }
    });
  }, []);

  const handleDataSave = useCallback((newData: DataRow[]) => {
    setData(newData);
    if (newData.length > 0) {
      const analysis = Object.keys(newData[0]).map(column => 
        analyzeColumn(newData, column)
      );
      setAnalysisResults(analysis);
    }
  }, []);

  return {
    data,
    columns,
    analysisResults,
    handleFileUpload,
    handleDataSave,
    setData,
    setColumns,
    setAnalysisResults
  };
};
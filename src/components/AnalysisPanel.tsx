import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AnalysisResult } from '../types';
import { Download } from 'lucide-react';

interface AnalysisPanelProps {
  results: AnalysisResult[];
}

export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ results }) => {
  const exportAnalysis = () => {
    const analysisText = results.map(result => {
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
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <button
          onClick={exportAnalysis}
          className="flex items-center px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          <Download className="h-4 w-4 mr-2" />
          Export Analysis
        </button>
      </div>
      
      {results.map((result) => (
        <div key={result.columnName} className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {result.columnName}
          </h3>
          
          {result.type === 'numeric' ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded">
                  <p className="text-sm text-gray-500">Mean</p>
                  <p className="text-lg font-semibold">{result.mean?.toFixed(2)}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded">
                  <p className="text-sm text-gray-500">Median</p>
                  <p className="text-lg font-semibold">{result.median?.toFixed(2)}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded">
                  <p className="text-sm text-gray-500">Std Dev</p>
                  <p className="text-lg font-semibold">{result.standardDeviation?.toFixed(2)}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded">
                  <p className="text-sm text-gray-500">Count</p>
                  <p className="text-lg font-semibold">{result.count}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded">
                  <p className="text-sm text-gray-500">Min</p>
                  <p className="text-lg font-semibold">{result.min?.toFixed(2)}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded">
                  <p className="text-sm text-gray-500">Max</p>
                  <p className="text-lg font-semibold">{result.max?.toFixed(2)}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded">
                  <p className="text-sm text-gray-500">Q1</p>
                  <p className="text-lg font-semibold">{result.quartiles?.q1.toFixed(2)}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded">
                  <p className="text-sm text-gray-500">Q3</p>
                  <p className="text-lg font-semibold">{result.quartiles?.q3.toFixed(2)}</p>
                </div>
              </div>
              <div className="h-64">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Distribution</h4>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={result.histogram}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="bin" angle={-45} textAnchor="end" height={70} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#60A5FA" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : (
            <div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded">
                  <p className="text-sm text-gray-500">Mode</p>
                  <p className="text-lg font-semibold">{result.mode}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded">
                  <p className="text-sm text-gray-500">Count</p>
                  <p className="text-lg font-semibold">{result.count}</p>
                </div>
              </div>
              <div className="h-64">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Value Distribution</h4>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={result.histogram}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="bin" angle={-45} textAnchor="end" height={70} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#60A5FA" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
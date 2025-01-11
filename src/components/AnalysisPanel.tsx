import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { AnalysisResult } from '../types';
import { Download } from 'lucide-react';

interface AnalysisPanelProps {
  results: AnalysisResult[];
}

export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ results }) => {
  const chartRefs = useRef<(HTMLDivElement | null)[]>([]);

  const renderBarChart = (data: any[], container: HTMLElement) => {
    const margin = { top: 20, right: 30, bottom: 50, left: 40 };
    const width = container.offsetWidth - margin.left - margin.right;
    const height = 240 - margin.top - margin.bottom;

    d3.select(container).select('svg').remove();

    const svg = d3
      .select(container)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3
      .scaleBand()
      .domain(data.map((d) => d.bin))
      .range([0, width])
      .padding(0.1);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.count) || 0])
      .nice()
      .range([height, 0]);

    svg
      .append('g')
      .selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', (d) => x(d.bin)!)
      .attr('y', (d) => y(d.count))
      .attr('width', x.bandwidth())
      .attr('height', (d) => height - y(d.count))
      .attr('fill', '#60A5FA');

    svg
      .append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).tickSizeOuter(0));

    svg.append('g').call(d3.axisLeft(y));
  };

  useEffect(() => {
    results.forEach((result, index) => {
      if (chartRefs.current[index]) {
        renderBarChart(result.histogram, chartRefs.current[index]!);
      }
    });
  }, [results]);

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

      {results.map((result, index) => (
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
              </div>
              <div
                ref={(el) => (chartRefs.current[index] = el)}
                className="h-64"
              />
            </>
          ) : (
            <>
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
              <div
                ref={(el) => (chartRefs.current[index] = el)}
                className="h-64"
              />
            </>
          )}
        </div>
      ))}
    </div>
  );
};

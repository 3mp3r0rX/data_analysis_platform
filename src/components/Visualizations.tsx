import React, { useState, useMemo, useCallback } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { DataRow } from '../types';

interface VisualizationsProps {
  data: DataRow[];
  columns: string[];
}

type ChartType = 'line' | 'bar' | 'scatter' | 'pie';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const MAX_DATA_POINTS = 1000; // Limit data points for better performance

export const Visualizations: React.FC<VisualizationsProps> = ({ data, columns }) => {
  const [chartType, setChartType] = useState<ChartType>('line');
  const [xAxis, setXAxis] = useState(columns[0]);
  const [yAxis, setYAxis] = useState(columns[1] || columns[0]);
  const [groupBy, setGroupBy] = useState<string>('');

  // Memoize data processing
  const processedData = useMemo(() => {
    // Sample data if it's too large
    const sampledData = data.length > MAX_DATA_POINTS
      ? data.filter((_, index) => index % Math.ceil(data.length / MAX_DATA_POINTS) === 0)
      : data;

    if (groupBy) {
      const groupedData = sampledData.reduce((acc: { [key: string]: number }, row) => {
        const key = String(row[groupBy]);
        const value = Number(row[yAxis]) || 0;
        acc[key] = (acc[key] || 0) + value;
        return acc;
      }, {});

      return Object.entries(groupedData)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 20); // Limit to top 20 groups
    }

    return sampledData.map(row => ({
      name: row[xAxis],
      value: Number(row[yAxis]) || 0
    }));
  }, [data, xAxis, yAxis, groupBy]);

  // Memoize chart rendering
  const renderChart = useCallback(() => {
    const commonProps = {
      width: "100%",
      height: 400
    };

    const commonCartesianProps = {
      ...commonProps,
      children: [
        <CartesianGrid key="grid" strokeDasharray="3 3" />,
        <XAxis key="x" dataKey="name" />,
        <YAxis key="y" />,
        <Tooltip key="tooltip" />,
        <Legend key="legend" />
      ]
    };

    switch (chartType) {
      case 'line':
        return (
          <ResponsiveContainer {...commonProps}>
            <LineChart data={processedData}>
              {commonCartesianProps.children}
              <Line
                type="monotone"
                dataKey="value"
                stroke="#8884d8"
                dot={processedData.length < 50} // Only show dots for small datasets
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer {...commonProps}>
            <BarChart data={processedData}>
              {commonCartesianProps.children}
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'scatter':
        return (
          <ResponsiveContainer {...commonProps}>
            <ScatterChart>
              {commonCartesianProps.children}
              <Scatter name={yAxis} data={processedData} fill="#8884d8" />
            </ScatterChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer {...commonProps}>
            <PieChart>
              <Pie
                data={processedData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={150}
                label={({ name, percent }) => 
                  percent > 0.05 ? `${name} (${(percent * 100).toFixed(0)}%)` : ''
                }
              >
                {processedData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
    }
  }, [chartType, processedData, yAxis]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Chart Type</label>
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value as ChartType)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="line">Line Chart</option>
            <option value="bar">Bar Chart</option>
            <option value="scatter">Scatter Plot</option>
            <option value="pie">Pie Chart</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">X-Axis</label>
          <select
            value={xAxis}
            onChange={(e) => setXAxis(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            {columns.map(col => (
              <option key={col} value={col}>{col}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Y-Axis</label>
          <select
            value={yAxis}
            onChange={(e) => setYAxis(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            {columns.map(col => (
              <option key={col} value={col}>{col}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Group By</label>
          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">None</option>
            {columns.map(col => (
              <option key={col} value={col}>{col}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        {data.length > MAX_DATA_POINTS && (
          <div className="text-sm text-gray-500 mb-4">
            Showing sampled data ({MAX_DATA_POINTS} points) for better performance
          </div>
        )}
        {renderChart()}
      </div>
    </div>
  );
};
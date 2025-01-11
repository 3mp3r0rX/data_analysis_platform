import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { DataRow } from '../types';

interface VisualizationsProps {
  data: DataRow[];
  columns: string[];
}

type ChartType = 'line' | 'bar' | 'scatter' | 'pie';

const MAX_DATA_POINTS = 1000;

export const Visualizations: React.FC<VisualizationsProps> = ({ data, columns }) => {
  const [chartType, setChartType] = useState<ChartType>('line');
  const [xAxis, setXAxis] = useState(columns[0]);
  const [yAxis, setYAxis] = useState(columns[1] || columns[0]);
  const [groupBy, setGroupBy] = useState<string>('');

  const svgRef = useRef<SVGSVGElement | null>(null);

  const processedData = useMemo(() => {
    const sampledData = data.length > MAX_DATA_POINTS
      ? data.filter((_, index) => index % Math.ceil(data.length / MAX_DATA_POINTS) === 0)
      : data;

    if (groupBy) {
      const groupedData = sampledData.reduce((acc: Record<string, number>, row) => {
        const key = String(row[groupBy]);
        const value = Number(row[yAxis]) || 0;
        acc[key] = (acc[key] || 0) + value;
        return acc;
      }, {});

      return Object.entries(groupedData)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 20);
    }

    return sampledData.map(row => ({
      name: String(row[xAxis]),
      value: Number(row[yAxis]) || 0,
    }));
  }, [data, xAxis, yAxis, groupBy]);

  useEffect(() => {
    if (!svgRef.current || !processedData.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 1150;
    const height = 400;
    const margin = { top: 20, right: 30, bottom: 50, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const xScale = d3.scaleBand()
      .domain(processedData.map(d => String(d.name)))
      .range([0, innerWidth])
      .padding(0.2);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(processedData, d => d.value) || 0])
      .nice()
      .range([innerHeight, 0]);

    const chartGroup = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    const drawAxes = () => {
      chartGroup.append('g').call(d3.axisLeft(yScale));
      chartGroup.append('g')
        .attr('transform', `translate(0, ${innerHeight})`)
        .call(d3.axisBottom(xScale))
        .selectAll('text')
        .attr('transform', 'rotate(-45)')
        .attr('text-anchor', 'end');
    };

    const drawChart = () => {
      if (chartType === 'bar') {
        chartGroup.selectAll('.bar')
          .data(processedData)
          .enter()
          .append('rect')
          .attr('x', d => xScale(String(d.name)) || 0)
          .attr('y', d => yScale(d.value))
          .attr('width', xScale.bandwidth())
          .attr('height', d => innerHeight - yScale(d.value))
          .attr('fill', '#8884d8');
      }

      if (chartType === 'line') {
        const line = d3.line<{ name: string; value: number }>()
          .x(d => (xScale(String(d.name)) || 0) + xScale.bandwidth() / 2)
          .y(d => yScale(d.value));

        chartGroup.append('path')
          .datum(processedData)
          .attr('fill', 'none')
          .attr('stroke', '#8884d8')
          .attr('stroke-width', 2)
          .attr('d', line);
      }

      if (chartType === 'scatter') {
        chartGroup.selectAll('.dot')
          .data(processedData)
          .enter()
          .append('circle')
          .attr('cx', d => (xScale(String(d.name)) || 0) + xScale.bandwidth() / 2)
          .attr('cy', d => yScale(d.value))
          .attr('r', 5)
          .attr('fill', '#8884d8');
      }

      if (chartType === 'pie') {
        const radius = Math.min(innerWidth, innerHeight) / 2;
        const pieGroup = svg.append('g')
          .attr('transform', `translate(${width / 2}, ${height / 2})`);

        const pie = d3.pie<{ name: string; value: number }>().value(d => d.value);
        const arc = d3.arc<d3.PieArcDatum<{ name: string; value: number }>>()
          .innerRadius(0)
          .outerRadius(radius);

        pieGroup.selectAll('path')
          .data(pie(processedData))
          .enter()
          .append('path')
          .attr('d', arc)
          .attr('fill', (_, i) => d3.schemeCategory10[i % 10]);
      }
    };

    drawAxes();
    drawChart();
  }, [chartType, processedData]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/** Chart Controls */}
        <div>
          <label>Chart Type</label>
          <select value={chartType} onChange={e => setChartType(e.target.value as ChartType)}>
            <option value="line">Line Chart</option>
            <option value="bar">Bar Chart</option>
            <option value="scatter">Scatter Plot</option>
            <option value="pie">Pie Chart</option>
          </select>
        </div>

        <div>
          <label>X-Axis</label>
          <select value={xAxis} onChange={e => setXAxis(e.target.value)}>
            {columns.map(col => <option key={col} value={col}>{col}</option>)}
          </select>
        </div>

        <div>
          <label>Y-Axis</label>
          <select value={yAxis} onChange={e => setYAxis(e.target.value)}>
            {columns.map(col => <option key={col} value={col}>{col}</option>)}
          </select>
        </div>

        <div>
          <label>Group By</label>
          <select value={groupBy} onChange={e => setGroupBy(e.target.value)}>
            <option value="">None</option>
            {columns.map(col => <option key={col} value={col}>{col}</option>)}
          </select>
        </div>
      </div>

      {/** Chart */}
      <svg ref={svgRef}></svg>
    </div>
  );
};

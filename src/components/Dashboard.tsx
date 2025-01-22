import React, { useState } from 'react';
import { DataRow } from '../types';
import { Visualizations } from './Visualizations';
import { AnalysisPanel } from './AnalysisPanel';
import { DataTable } from './DataTable';
import { Plus, Trash2, Layout, MoveVertical, Save, Eye } from 'lucide-react';

interface DashboardProps {
  data: DataRow[];
  columns: string[];
  analysisResults: any[];
}

interface Widget {
  id: string;
  type: 'chart' | 'table' | 'analysis';
  title: string;
  size: 'small' | 'medium' | 'large';
  config?: any;
}

export const Dashboard: React.FC<DashboardProps> = ({ data, columns, analysisResults }) => {
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [editMode, setEditMode] = useState(true);
  const [dashboardName, setDashboardName] = useState('My Dashboard');

  const addWidget = (type: Widget['type']) => {
    const newWidget: Widget = {
      id: Date.now().toString(),
      type,
      title: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      size: 'medium'
    };
    setWidgets([...widgets, newWidget]);
  };

  const removeWidget = (id: string) => {
    setWidgets(widgets.filter(w => w.id !== id));
  };

  const updateWidgetSize = (id: string) => {
    setWidgets(widgets.map(w => {
      if (w.id === id) {
        const sizes: Widget['size'][] = ['small', 'medium', 'large'];
        const currentIndex = sizes.indexOf(w.size);
        const nextSize = sizes[(currentIndex + 1) % sizes.length];
        return { ...w, size: nextSize };
      }
      return w;
    }));
  };

  const updateWidgetTitle = (id: string, title: string) => {
    setWidgets(widgets.map(w => 
      w.id === id ? { ...w, title } : w
    ));
  };

  const getSizeClass = (size: Widget['size']) => {
    switch (size) {
      case 'small': return 'col-span-1';
      case 'medium': return 'col-span-2';
      case 'large': return 'col-span-3';
      default: return 'col-span-2';
    }
  };

  const renderWidget = (widget: Widget) => {
    const WidgetWrapper = ({ children }: { children: React.ReactNode }) => (
      <div className={`${getSizeClass(widget.size)} bg-white rounded-lg shadow-sm`}>
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {editMode ? (
              <input
                type="text"
                value={widget.title}
                onChange={(e) => updateWidgetTitle(widget.id, e.target.value)}
                className="text-lg font-medium bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none"
              />
            ) : (
              <h3 className="text-lg font-medium">{widget.title}</h3>
            )}
            {editMode && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => updateWidgetSize(widget.id)}
                  className="p-1 text-gray-500 hover:text-gray-700"
                  title="Change size"
                >
                  <MoveVertical className="h-4 w-4" />
                </button>
                <button
                  onClick={() => removeWidget(widget.id)}
                  className="p-1 text-red-500 hover:text-red-700"
                  title="Remove widget"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="p-4">{children}</div>
      </div>
    );

    switch (widget.type) {
      case 'chart':
        return (
          <WidgetWrapper>
            <Visualizations data={data} columns={columns} />
          </WidgetWrapper>
        );
      case 'table':
        return (
          <WidgetWrapper>
            <DataTable data={data} columns={columns} />
          </WidgetWrapper>
        );
      case 'analysis':
        return (
          <WidgetWrapper>
            <AnalysisPanel results={analysisResults} />
          </WidgetWrapper>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        {editMode ? (
          <input
            type="text"
            value={dashboardName}
            onChange={(e) => setDashboardName(e.target.value)}
            className="text-2xl font-bold bg-transparent border-b-2 border-gray-300 focus:border-blue-500 focus:outline-none"
          />
        ) : (
          <h2 className="text-2xl font-bold">{dashboardName}</h2>
        )}
        <div className="flex items-center space-x-4">
          {editMode && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => addWidget('chart')}
                className="flex items-center px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Chart
              </button>
              <button
                onClick={() => addWidget('table')}
                className="flex items-center px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Table
              </button>
              <button
                onClick={() => addWidget('analysis')}
                className="flex items-center px-3 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Analysis
              </button>
            </div>
          )}
          <button
            onClick={() => setEditMode(!editMode)}
            className={`flex items-center px-3 py-2 ${
              editMode ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-500 hover:bg-blue-600'
            } text-white rounded`}
          >
            {editMode ? (
              <>
                <Eye className="h-4 w-4 mr-2" />
                View Mode
              </>
            ) : (
              <>
                <Layout className="h-4 w-4 mr-2" />
                Edit Layout
              </>
            )}
          </button>
          <button
            onClick={() => {
              // Save dashboard configuration
              const config = {
                name: dashboardName,
                widgets: widgets.map(({ id, type, title, size }) => ({
                  id, type, title, size
                }))
              };
              const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${dashboardName.toLowerCase().replace(/\s+/g, '-')}.json`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }}
            className="flex items-center px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Dashboard
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {widgets.map(widget => renderWidget(widget))}
      </div>

      {widgets.length === 0 && (
        <div className="text-center py-12">
          <Layout className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Create Your Dashboard</h3>
          <p className="text-gray-500">
            Add widgets to create a custom dashboard for your data analysis
          </p>
        </div>
      )}
    </div>
  );
};
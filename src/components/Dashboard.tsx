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
      case 'small': return 'col-span-1 md:col-span-1';
      case 'medium': return 'col-span-2 md:col-span-2';
      case 'large': return 'col-span-3 md:col-span-3';
      default: return 'col-span-2';
    }
  };

  const WidgetWrapper = ({ children, widget }: { children: React.ReactNode; widget: Widget }) => (
    <div className={`
      ${getSizeClass(widget.size)} 
      bg-white backdrop-blur-sm bg-opacity-90
      rounded-xl shadow-lg hover:shadow-xl transition-shadow
      border border-gray-100 overflow-hidden
      ${editMode ? 'hover:border-blue-200' : 'border-transparent'}
      transition-all duration-300
    `}>
      <div className="p-4 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center justify-between space-x-4">
          {editMode ? (
            <input
              type="text"
              value={widget.title}
              onChange={(e) => updateWidgetTitle(widget.id, e.target.value)}
              className="text-md font-semibold bg-transparent focus:outline-none 
                        border-b-2 border-transparent focus:border-blue-500 
                        transition-colors px-1 py-0.5"
            />
          ) : (
            <h3 className="text-md font-semibold text-gray-700">{widget.title}</h3>
          )}
          {editMode && (
            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => updateWidgetSize(widget.id)}
                className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg
                          transition-colors duration-200"
                title="Change size"
              >
                <MoveVertical className="h-4 w-4" />
              </button>
              <button
                onClick={() => removeWidget(widget.id)}
                className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg
                          transition-colors duration-200"
                title="Remove widget"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="p-4 h-[calc(100%-52px)] overflow-auto">{children}</div>
    </div>
  );

  

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
      <div className="flex flex-wrap gap-4 items-center justify-between">
        {editMode ? (
          <input
            type="text"
            value={dashboardName}
            onChange={(e) => setDashboardName(e.target.value)}
            className="text-2xl font-bold bg-transparent focus:outline-none
                      border-b-2 border-transparent focus:border-blue-500
                      px-1 py-0.5 transition-colors"
          />
        ) : (
          <h2 className="text-2xl font-bold text-gray-800">{dashboardName}</h2>
        )}
        
        <div className="flex flex-wrap gap-3 items-center">
          {editMode && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => addWidget('chart')}
                className="flex items-center px-4 py-2 bg-white text-gray-700 rounded-xl
                          border border-gray-200 hover:border-blue-500 hover:text-blue-600
                          transition-all shadow-sm hover:shadow-md"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Chart
              </button>
              <button
                onClick={() => addWidget('table')}
                className="flex items-center px-4 py-2 bg-white text-gray-700 rounded-xl
                          border border-gray-200 hover:border-green-500 hover:text-green-600
                          transition-all shadow-sm hover:shadow-md"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Table
              </button>
              <button
                onClick={() => addWidget('analysis')}
                className="flex items-center px-4 py-2 bg-white text-gray-700 rounded-xl
                          border border-gray-200 hover:border-purple-500 hover:text-purple-600
                          transition-all shadow-sm hover:shadow-md"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Analysis
              </button>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => setEditMode(!editMode)}
              className={`flex items-center px-4 py-2 rounded-xl transition-all
                        ${editMode 
                          ? 'bg-white text-blue-600 border border-blue-200 hover:bg-blue-50' 
                          : 'bg-blue-600 text-white hover:bg-blue-700'}
                        shadow-sm hover:shadow-md`}
            >
              {editMode ? (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </>
              ) : (
                <>
                  <Layout className="h-4 w-4 mr-2" />
                  Edit Layout
                </>
              )}
            </button>       <button
            onClick={() => {
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {widgets.map(widget => renderWidget(widget))}
      </div>

      {widgets.length === 0 && (
        <div className="text-center py-12 rounded-2xl bg-white/50 border-2 border-dashed border-gray-200">
          <div className="inline-block p-6 bg-blue-50 rounded-2xl mb-4">
            <Layout className="h-12 w-12 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Start Building Your Dashboard
          </h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Add visualizations, tables, and analysis panels to create a personalized view of your data
          </p>
          {editMode && (
            <button
              onClick={() => addWidget('chart')}
              className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-xl
                        hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
            >
              Add Your First Widget
            </button>
          )}
        </div>
      )}
    </div>
  );
};
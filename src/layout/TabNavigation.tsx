import React from 'react';

type Tab = 'dashboard' | 'data' | 'analysis' | 'edit' | 'sql' | 'visualize' | 'notebook' | 'curate';

interface TabNavigationProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, setActiveTab }) => {
  const tabs: Tab[] = [
    'dashboard',
    'data',
    'analysis',
    'visualize',
    'edit',
    'curate',
    'sql',
    'notebook',
  ];

  return (
    <div className="flex space-x-4 border-b border-gray-300 dark:border-gray-700 pb-2">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`py-2 px-4 rounded ${
            activeTab === tab
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          {tab.charAt(0).toUpperCase() + tab.slice(1)}
        </button>
      ))}
    </div>
  );
};
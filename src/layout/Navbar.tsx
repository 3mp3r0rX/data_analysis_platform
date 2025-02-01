import React from 'react';

interface NavbarProps {
  toggleDarkMode: () => void;
  notifications: Notification[];
  removeNotification: (id: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ toggleDarkMode, notifications, removeNotification }) => {
  return (
    <nav className="bg-gray-800 text-white py-4 px-6 flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-bold">Data Analytics SaaS</h1>
        <button onClick={toggleDarkMode} className="bg-gray-700 px-3 py-1 rounded">
          Toggle Dark Mode
        </button>
      </div>
      <div>
        <button
          onClick={() => notifications.forEach((n) => removeNotification(n.id))}
          className="bg-red-500 px-3 py-1 rounded"
        >
          Clear Notifications
        </button>
      </div>
    </nav>
  );
};
import React, { useState } from 'react';
import { Bell, Moon, Sun, X } from 'lucide-react';

interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface NavbarProps {
  toggleDarkMode: () => void;
  notifications: Notification[];
  removeNotification: (id: string) => void;
  isDarkMode?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  toggleDarkMode, 
  notifications, 
  removeNotification,
  isDarkMode = false 
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const getNotificationStyles = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200';
      case 'error':
        return 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200';
      default:
        return 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200';
    }
  };

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 lg:px-6 py-2.5 fixed w-full top-0 z-50 backdrop-blur-sm bg-opacity-80 dark:bg-opacity-80">
      <div className="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl">
        {/* Logo and Brand */}
        <div className="flex items-center">
          <span className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Data Analytics
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
            aria-label="Toggle theme"
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
              aria-label="View notifications"
            >
              <div className="relative">
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </div>
            </button>

            {/* Notifications Dropdown */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-3 w-80 max-h-96 overflow-y-auto bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="p-4 space-y-3">
                  {notifications.length > 0 ? (
                    <>
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`relative p-4 rounded-lg border ${getNotificationStyles(notification.type)}`}
                        >
                          <div className="pr-8">
                            <p className="text-sm font-medium">
                              {notification.message}
                            </p>
                          </div>
                          <button
                            onClick={() => removeNotification(notification.id)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => notifications.forEach((n) => removeNotification(n.id))}
                        className="w-full text-center py-2 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors duration-200"
                      >
                        Clear all notifications
                      </button>
                    </>
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No notifications yet</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
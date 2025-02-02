import { useState, useCallback } from 'react';
import initSqlJs from 'sql.js';

interface SqlFile {
  id: string;
  name: string;
  content: string;
}

interface SqliteDb {
  name: string;
  db: any;
}

interface SqlResult {
  columns: string[];
  values: any[][];
}

const initializeSqlJs = async () => {
  try {
    // Dynamically import the package
    const sqlJsModule = await import('sql.js-httpvfs');
    
    // Check if the default export contains initSqlJs
    const SQL = sqlJsModule.default || sqlJsModule;
    
    if (typeof SQL.initSqlJs !== 'function') {
      throw new Error('initSqlJs is not a function in the imported module');
    }
    
    // Initialize SQL.js
    const instance = await SQL.initSqlJs({
      locateFile: (file: string) => `https://sql.js.org/dist/1.8.0/${file}`,
    });

    return instance;
  } catch (error) {
    console.error('Error initializing SQL.js:', error);
    throw error;
  }
};

export const useSqlite = (
  addNotification: (message: string, type?: 'success' | 'error' | 'info') => void
) => {
  const [sqlQuery, setSqlQuery] = useState<string>('SELECT * FROM sqlite_master WHERE type="table";');
  const [sqlOutput, setSqlOutput] = useState<string>('');
  const [sqlFiles, setSqlFiles] = useState<SqlFile[]>([]);
  const [sqliteDbs, setSqliteDbs] = useState<SqliteDb[]>([]);
  const [activeDb, setActiveDb] = useState<string | null>(null);
  const [queryHistory, setQueryHistory] = useState<string[]>([]);
  const [isExecutingSql, setIsExecutingSql] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const sqliteDb = sqliteDbs.find((db) => db.name === activeDb) || null;

  const handleSqlFileUpload = useCallback(
    async (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setSqlFiles((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            name: file.name,
            content,
          },
        ]);
        addNotification(`Successfully uploaded SQL file: ${file.name}`, 'success');
      };
      reader.readAsText(file);
    },
    [addNotification]
  );

  const handleSqliteFileUpload = useCallback(
    async (file: File) => {
      setIsLoading(true);
      try {
        const SQL = await initializeSqlJs();
        const buffer = await file.arrayBuffer();
        const db = new SQL.Database(new Uint8Array(buffer));
        try {
          db.exec('SELECT 1'); // Test query to validate the database
        } catch (e) {
          throw new Error('Invalid SQLite database file');
        }
        const newDb: SqliteDb = { name: file.name, db };
        setSqliteDbs((prev) => [...prev, newDb]);
        setActiveDb(file.name);
        addNotification(`Successfully loaded SQLite database: ${file.name}`, 'success');
      } catch (error) {
        console.error('Error loading SQLite database:', error);
        addNotification(`Failed to load SQLite database: ${error.message}`, 'error');
      } finally {
        setIsLoading(false);
      }
    },
    [addNotification]
  );

  const executeSQL = useCallback(async () => {
    if (!sqlQuery.trim()) {
      addNotification('SQL query cannot be empty.', 'error');
      return;
    }
    if (!sqliteDb) {
      addNotification('Please select a SQLite database first.', 'error');
      return;
    }
    setIsExecutingSql(true);
    try {
      const results: SqlResult[] = sqliteDb.db.exec(sqlQuery);
      setSqlOutput(JSON.stringify(results, null, 2));
      setQueryHistory((prev) => [...prev, sqlQuery]); // Save query to history
      addNotification('SQL query executed successfully.', 'success');
    } catch (error) {
      console.error('SQL execution error:', error);
      setSqlOutput(`Error: ${error.message}`);
      addNotification(`SQL execution failed: ${error.message}`, 'error');
    } finally {
      setIsExecutingSql(false);
    }
  }, [sqlQuery, sqliteDb, addNotification]);

  const handleSqlFileDelete = useCallback(
    (id: string) => {
      setSqlFiles((prev) => prev.filter((file) => file.id !== id));
      addNotification('SQL file deleted successfully.', 'success');
    },
    [addNotification]
  );

  const handleSqlFileExecute = useCallback(
    (content: string) => {
      setSqlQuery(content);
      executeSQL();
    },
    [executeSQL]
  );

  const handleExportDatabase = useCallback(() => {
    if (!sqliteDb?.db) {
      addNotification('No SQLite database to export.', 'error');
      return;
    }
    try {
      const data = sqliteDb.db.export();
      const blob = new Blob([data], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${sqliteDb.name}.sqlite`;
      link.click();
      URL.revokeObjectURL(url);
      addNotification(`Exported SQLite database: ${sqliteDb.name}`, 'success');
    } catch (error) {
      console.error('Error exporting SQLite database:', error);
      addNotification(`Failed to export SQLite database: ${error.message}`, 'error');
    }
  }, [sqliteDb, addNotification]);

  return {
    sqlQuery,
    sqlOutput,
    sqlFiles,
    sqliteDbs,
    sqliteDb,
    activeDb,
    queryHistory,
    isExecutingSql,
    isLoading,
    setSqlQuery,
    setSqliteDbs,
    setActiveDb,
    handleSqlFileUpload,
    handleSqliteFileUpload,
    executeSQL,
    handleSqlFileDelete,
    handleSqlFileExecute,
    handleExportDatabase,
  };
};

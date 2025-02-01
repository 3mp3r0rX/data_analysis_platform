import { useState, useCallback } from 'react';


// Define types
interface SqlFile {
  id: string;
  name: string;
  content: string;
}

interface SqliteDb {
  name: string;
  db: any; // Replace `any` with a more specific type if available
}

interface SqlResult {
  columns: string[];
  values: any[][];
}

const initializeSqlJs = async () => {
  try {
    const SQL = await (await import('sql.js-httpvfs')).default({
      locateFile: (file: string) => `https://sql.js.org/dist/1.8.0/${file}`,
    });
    return SQL;
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

  // Handle uploading .sql files
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

  // Handle uploading SQLite database files
  const handleSqliteFileUpload = useCallback(
    async (file: File) => {
      setIsLoading(true);
      try {
        const SQL = await initializeSqlJs();
        if (!SQL) throw new Error('Failed to initialize SQL.js');
        const buffer = await file.arrayBuffer();
        if (!buffer) throw new Error('Failed to read file');
        const db = new SQL.Database(new Uint8Array(buffer));
        try {
          db.exec('SELECT 1'); // Test query to validate the database
        } catch (e) {
          throw new Error('Invalid SQLite database file');
        }
        const newDb: SqliteDb = { name: file.name, db };
        setSqliteDbs((prev) => [...prev, newDb]);
        setActiveDb(file.name); // Set the newly uploaded database as active
        addNotification(`Successfully loaded SQLite database: ${file.name}`, 'success');
      } catch (error) {
        console.error('Error loading SQLite database:', error);
        addNotification(`Failed to load SQLite database: ${error.message}`, 'error');
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [addNotification]
  );

  // Execute SQL query on the active database
  const executeSQL = useCallback(async () => {
    if (!sqlQuery.trim()) {
      addNotification('SQL query cannot be empty.', 'error');
      return;
    }
    const activeDatabase = sqliteDbs.find((db) => db.name === activeDb)?.db;
    if (!activeDatabase) {
      addNotification('Please select a SQLite database first.', 'error');
      return;
    }
    setIsExecutingSql(true);
    try {
      const results: SqlResult[] = activeDatabase.exec(sqlQuery);
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
  }, [sqlQuery, activeDb, sqliteDbs, addNotification]);

  // Delete an uploaded SQL file
  const handleSqlFileDelete = useCallback(
    (id: string) => {
      setSqlFiles((prev) => prev.filter((file) => file.id !== id));
      addNotification('SQL file deleted successfully.', 'success');
    },
    [addNotification]
  );

  // Export the active SQLite database to a file
  const handleExportDatabase = useCallback(() => {
    const activeDatabase = sqliteDbs.find((db) => db.name === activeDb);
    if (!activeDatabase?.db) {
      addNotification('No SQLite database to export.', 'error');
      return;
    }
    try {
      const data = activeDatabase.db.export();
      const blob = new Blob([data], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${activeDatabase.name}.sqlite`;
      link.click();
      URL.revokeObjectURL(url);
      addNotification(`Exported SQLite database: ${activeDatabase.name}`, 'success');
    } catch (error) {
      console.error('Error exporting SQLite database:', error);
      addNotification(`Failed to export SQLite database: ${error.message}`, 'error');
    }
  }, [activeDb, sqliteDbs, addNotification]);

  return {
    sqlQuery,
    sqlOutput,
    sqlFiles,
    sqliteDbs,
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
    handleExportDatabase,
  };
};
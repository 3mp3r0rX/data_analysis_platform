declare module 'sql.js-httpvfs' {
    export interface SqlJs {
      initSqlJs: (config: { locateFile: (file: string) => string }) => Promise<any>;
      Database: any;
    }
  
    const initSqlJs: SqlJs['initSqlJs'];
    export default { initSqlJs };
  }
  
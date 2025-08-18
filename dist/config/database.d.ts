import mysql from 'mysql2/promise';
export interface DatabaseConfig {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
}
export declare const dbConfig: DatabaseConfig;
export declare function connectDatabase(): Promise<mysql.Connection>;
export declare function createDatabaseIfNotExists(): Promise<void>;
export declare function executeQuery(query: string, params?: any[]): Promise<any>;
export declare function closeDatabaseConnection(): Promise<void>;
declare const pool: mysql.Pool;
export default pool;
//# sourceMappingURL=database.d.ts.map
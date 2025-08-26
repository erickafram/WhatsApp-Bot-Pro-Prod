import mysql from 'mysql2/promise';
export interface DatabaseConfig {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
}
export declare const dbConfig: DatabaseConfig;
declare const pool: mysql.Pool;
export declare function ensurePoolConnection(): Promise<void>;
export declare function connectDatabase(): Promise<mysql.Connection>;
export declare function createDatabaseIfNotExists(): Promise<void>;
export declare function executeQuery(query: string, params?: any[]): Promise<any>;
export declare function closeDatabaseConnection(): Promise<void>;
export declare function closePool(): Promise<void>;
export declare function getPoolStats(): {
    totalConnections: any;
    idleConnections: any;
    busyConnections: number;
    status: string;
    error?: undefined;
} | {
    totalConnections: number;
    idleConnections: number;
    busyConnections: number;
    status: string;
    error: string;
};
export default pool;
//# sourceMappingURL=database.d.ts.map
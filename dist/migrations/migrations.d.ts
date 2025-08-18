export interface Migration {
    id: string;
    description: string;
    up: () => Promise<void>;
    down: () => Promise<void>;
}
export declare const migrations: Migration[];
export declare const runMigrations: () => Promise<void>;
export declare const rollbackMigrations: (steps?: number) => Promise<void>;
//# sourceMappingURL=migrations.d.ts.map
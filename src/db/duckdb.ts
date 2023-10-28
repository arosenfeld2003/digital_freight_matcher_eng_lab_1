import duckdb from 'duckdb'

export class DuckDBManager {
    private static instance: DuckDBManager;
    private db: duckdb.Database | null;

    private constructor() {
        this.db = null;
    }

    static getInstance(): DuckDBManager {
        if (!DuckDBManager.instance) {
            DuckDBManager.instance = new DuckDBManager;
        }
        return DuckDBManager.instance;
    }

    async initDatabase(databasepath: string): Promise<void> {
        try {
            this.db = new duckdb.Database(databasepath);
            this.db.connect();
            console.log('DuckDB initialized with connection.');
        } catch(e) {
            console.error('Error initializing DuckDB with connection: ', e)
            throw(e);
        }
    }

    getDatabase(): duckdb.Database | null {
        return this.db;
    }
}

export const duckDBManager = DuckDBManager.getInstance();


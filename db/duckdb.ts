import DuckDB from 'duckdb'

class DuckDBManager {
    private static instance: DuckDBManager;
    private db: DuckDB.Database | null;

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
            this.db = new DuckDB.Database(databasepath);
            await this.db.conect({path: databasepath})
            console.log('DuckDB Initialized Successfully.');
        } catch(e) {
            console.error('Error initializing DuckB: ', e)
            throw(e);
        }
    }

    getDatabase(): DuckDB.Database | null {
        return this.db;
    }
}

export const duckDBManager = DuckDBManager.getInstance();


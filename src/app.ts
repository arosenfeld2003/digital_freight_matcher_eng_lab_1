import express from "express";
import { duckDBManager } from "./db/duckdb";

const app = express();
const DATABASE_PATH = "src/db/duckdb.ts"

const db = async() => {
    // wrapped in async so we can await the return of initDatabase
    await duckDBManager.initDatabase(DATABASE_PATH);
    duckDBManager.getDatabase();
}

app.listen(3000, () => {
    console.log('Server is running on port 3000')
})


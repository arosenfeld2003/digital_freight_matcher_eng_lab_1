import express from "express";
import { duckDBManager } from "@db/duckdb";
import 'dotenv/config';

const app = express();
const databasePath = "src/db/duckdb.db"

const db = (async() => {
    await duckDBManager.initDatabase(databasePath)
    duckDBManager.getDatabase();
})().then(r => app.listen(3000, () => {
    console.log('Server is running on port 3000')
}));


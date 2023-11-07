import { duckDBManager } from "@db/duckdb";
import duckdb from "duckdb";
export async function createCoordinatesTable(): Promise<duckdb.TableData> {
    return new Promise((resolve, reject) => {
        const db = duckDBManager.getDatabase();
        if (!db) {
            console.log(`db is null`);
            reject('db is null');
        } else {
            // console.log(`db: ${JSON.stringify(db)}`);
            db.all(
                'CREATE TABLE IF NOT EXISTS coordinates(id INTEGER PRIMARY KEY AUTOINCREMENT,\n' +
                '                latitude REAL NOT NULL,\n' +
                '                longitude REAL NOT NULL,\n' +
                '                route_id INTEGER NOT NULL,\n' +
                '                client_id INTEGER NOT NULL' +
                ')', function(err, result) {
                    if (err) {
                        reject(err);
                    }
                }
            )
            const data = db.all(`SELECT * FROM coordinates`, function(err, result) {
                if (err) {
                    reject(err);
                }
                resolve(result);
            });
        }
    });
}

export async function insertCoordinate(coordinateData: {
    latitude: number;
    longitude: number;
    route_id: number;
    client_id: number;
}): Promise<duckdb.TableData> {
    const db = duckDBManager.getDatabase();
    return await new Promise((resolve, reject) => {
        db?.all(
            `INSERT INTO coordinates (latitude, longitude, route_id, client_id) VALUES (?, ?, ?, ?)`,
            [coordinateData.latitude, coordinateData.longitude, coordinateData.route_id, coordinateData.client_id],
            function (err, data) {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            }
        );
    });
}

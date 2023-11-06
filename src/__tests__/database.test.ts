import { duckDBManager } from '@db/duckdb';
import { createCoordinatesTable, insertCoordinate } from '@db/coordinates';
import duckdb from "duckdb";

// creat db variable available globally
let db;

describe('Coordinates Table Tests', () => {
    beforeAll(async () => {
        // Initialize DuckDB instance
        await duckDBManager.initDatabase('src/db/testDatabase.db');
        db = duckDBManager.getDatabase();
    });

    afterAll(async() => {
        // Close the DB connection
        duckDBManager.getDatabase()?.close();
    });

    beforeEach(async () => {
        await createCoordinatesTable();
    });

    afterEach(async() => {
        // Clean up the 'coordinates' table
    });

    it('should create the coordinates table', async() => {
        const coordinatesTable = new Promise<duckdb.TableData>(resolve => {
            let queryResult = createCoordinatesTable();
            if (!queryResult) {
                throw({ coordinatedTable: 'coordinatesTable not created' });
            }
            resolve(queryResult);
        })
    });


    // it('should insert coordinates into the table', async () => {
    //     const coordinateData = {
    //         latitude: 33.754413815792205,
    //         longitude: -84.3875298776525,
    //         route_id: 1,
    //         client_id: 1,
    //     };
    //
    //     // insert coordinate into the table
    //     const queryRes = await new Promise((resolve, reject) => {
    //         db?.all('SELECT * FROM coordinates WHERE route_id = 1 AND client_id = 1', (err, res) => {
    //             if (err) {
    //                 reject(err);
    //             } else {
    //                 console.log(res);
    //                 resolve(res);
    //             }
    //         })
    //     });
    //     // assertions
    //     expect(queryRes).toHaveLength(1);
    //     // expect(queryRes[0].latitude).toBe(coordinateData.latitude);
    //     // expect(res[0].latitude).toBe(coordinateData.longitude);
    // });
})

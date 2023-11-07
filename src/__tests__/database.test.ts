import { duckDBManager } from '@db/duckdb'
import { createCoordinatesTable, insertCoordinate } from '@db/coordinates'
import { expect, jest, test } from '@jest/globals'
import duckdb from 'duckdb'

// creat db variable available globally
let db

describe('Coordinates Table Tests', () => {
  beforeAll(async () => {
    // Initialize DuckDB instance
    await duckDBManager.initDatabase('src/db/testDatabase.db')
  })

  afterAll(async () => {
    // Close the DB connection
    duckDBManager.getDatabase()?.close()
  })

  afterEach(async () => {
    // Clean up the 'coordinates' table
    duckDBManager.getDatabase()?.connect().all(
      'DROP TABLE IF EXISTS coordinates'
    )
  })

  it('should connect to the db', () => {
    db = duckDBManager.getDatabase()
    expect(db?.connect()).toBeTruthy()
  })

  it('should create the coordinates table and insert coordinates', () => {
    const coordinateData = {
      latitude: 33.754413815792205,
      longitude: -84.3875298776525,
      route_id: 1,
      client_id: 1
    }
    db = duckDBManager.getDatabase()
    const con = db?.connect()
    expect(createCoordinatesTable(con)).toBeDefined()
    con.all('INSERT INTO coordinates VALUES (?, ?, ?, ?)',
      [coordinateData.latitude, coordinateData.longitude, coordinateData.route_id, coordinateData.client_id]
    )
    con.all('SELECT * FROM coordinates WHERE route_id = 1 AND client_id = 1', (err: any, res: any) => {
      if (err !== undefined) {
        console.error(err)
        throw (err)
      }
      expect(res).toHaveLength(1)
    })
  })
})

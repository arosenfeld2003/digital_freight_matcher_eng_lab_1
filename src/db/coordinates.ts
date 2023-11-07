// import { duckDBManager } from "@db/duckdb";
import type duckdb from 'duckdb'
export function createCoordinatesTable (con: duckdb.Connection): duckdb.TableData | undefined {
  let data: duckdb.TableData | undefined
  con.all(
    'CREATE TABLE IF NOT EXISTS coordinates(id INTEGER PRIMARY KEY AUTOINCREMENT,\n' +
    '                latitude REAL NOT NULL,\n' +
    '                longitude REAL NOT NULL,\n' +
    '                route_id INTEGER NOT NULL,\n' +
    '                client_id INTEGER NOT NULL' +
    ')', (err: any, res: any) => {
      if (err !== undefined) {
        console.error(err)
        throw (err)
      } else {
        con.all('SELECT * FROM coordinates', (err, res) => {
          if (err !== undefined) {
            console.error(err)
            // eslint-disable-next-line @typescript-eslint/no-throw-literal
            throw (err)
          }
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          data = res[0]
        })
      }
    }
  )
  return data
}

export function insertCoordinate (con: duckdb.Connection, coordinateData: {
  latitude: number
  longitude: number
  route_id: number
  client_id: number
}): boolean {
  const stmt = con.prepare(
    'INSERT INTO coordinates (latitude, longitude, route_id, client_id) VALUES (?, ?, ?, ?)',
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    [coordinateData.latitude, coordinateData.longitude, coordinateData.route_id, coordinateData.client_id]
  )
  stmt.all(function (err: any, res: any) {
    if (err !== undefined) {
      console.error(err)
      throw (err)
    }
  })
  return true
}

import { Pool } from 'pg'
import dotenv from 'dotenv'
import process from 'process'

dotenv.config()

class DB {
  private static instance: DB
  private readonly pool: Pool

  private constructor () {
    this.pool = new Pool({
      user: process.env.PG_USER,
      host: process.env.PG_HOST,
      database: process.env.PG_DB,
      password: process.env.PG_PW,
      port: Number(process.env.PG_PORT)
    })
  }

  public static getInstance (): DB {
    if (DB.instance === undefined) {
      DB.instance = new DB()
    }
    return DB.instance
  }

  public static async closePool (): Promise<void> {
    await DB.instance.pool.end()
  }

  public async query (text: string, params?: any[]): Promise<any> {
    const client = await this.pool.connect()
    let ret: any;
    try {
      const [queryRes] = await Promise.all([client.query(text, params)])
      client.release()
      return queryRes
    } catch (e) {
      console.error(e)
    }
  }

  public async createTables (): Promise<Error | true> {
    try {
      const getTablesQuery = `
        SELECT * FROM pg_catalog.pg_tables WHERE schemaname = 'public';
      `
      const tableQueries = `
              CREATE TABLE IF NOT EXISTS route (
                  id SERIAL PRIMARY KEY,
                  origin VARCHAR(255),
                  destination VARCHAR(255),
                  profitability INT
              );
              CREATE TABLE IF NOT EXISTS cargo (
                  id SERIAL PRIMARY KEY,
                  order_id INT,
                  package_id INT
              );
              CREATE TABLE IF NOT EXISTS location (
                  id SERIAL PRIMARY KEY,
                  latitude INT,
                  longitude INT,
                  route_id INT,
                  client_id INT
              );
              CREATE TABLE IF NOT EXISTS request (
                  id SERIAL PRIMARY KEY,
                  origin_location_id INT,
                  destination_location_id INT,
                  cargo_id INT,
                  route_id INT,
                  contract_type VARCHAR(255)
              );
              CREATE TABLE IF NOT EXISTS parcel (
                  id SERIAL PRIMARY KEY,
                  cargo_id INT,
                  volume INT,
                  weight INT,
                  type VARCHAR(255)
              );
              CREATE TABLE IF NOT EXISTS truck (
                  id SERIAL PRIMARY KEY,
                  autonomy VARCHAR(255),
                  capacity INT,
                  type VARCHAR(255)
              );
              CREATE TABLE IF NOT EXISTS client (
                  id SERIAL PRIMARY KEY,
                  company_name VARCHAR(255),
                  company_client_id INT
              );
          `
      const foreignKeyQueries = `
              ALTER TABLE location ADD CONSTRAINT fk_location_client
                  FOREIGN KEY (client_id) REFERENCES client(id);
              ALTER TABLE "request" ADD CONSTRAINT fk_request_origin_location
                  FOREIGN KEY (origin_location_id) REFERENCES location(id);
              ALTER TABLE "request" ADD CONSTRAINT fk_request_destination_location
                  FOREIGN KEY (destination_location_id) REFERENCES location(id);
              ALTER TABLE "request" ADD CONSTRAINT fk_request_cargo
                  FOREIGN KEY (cargo_id) REFERENCES cargo(id);
              ALTER TABLE "request" ADD CONSTRAINT fk_request_route
                  FOREIGN KEY (route_id) REFERENCES route(id);
              ALTER TABLE "parcel" ADD CONSTRAINT fk_parcel_cargo
                  FOREIGN KEY (cargo_id) REFERENCES cargo(id);
              ALTER TABLE "cargo" ADD CONSTRAINT fk_cargo_truck
                  FOREIGN KEY (truck_id) REFERENCES truck(id);
       `
      const tables = await this.query(getTablesQuery)
      // if brand new database, instantiate with the requisite tables
      if (tables.rowCount === 0) {
        await this.query(tableQueries)
        await this.query(foreignKeyQueries)
        console.log('Default DB tables created on public schema')
      } else {
        console.log('DB public schema already contains tables')
      }
    } catch (e: any) {
      return e
    }
    return true
  }
}

export default DB

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

  public async query (text: string, params?: any[]): Promise<any> {
    try {
      const client = await this.pool.connect()
      const [queryRes] = await Promise.all([client.query(text, params)])
      client.release()
      return queryRes
    } catch (e) {
      console.error(e)
      throw (e)
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
              CREATE TABLE IF NOT EXISTS "order" (
                  id SERIAL PRIMARY KEY,
                  origin_location_id INT,
                  destination_location_id INT,
                  cargo_id INT,
                  route_id INT,
                  contract_type VARCHAR(255)
              );
              CREATE TABLE IF NOT EXISTS package (
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
              ALTER TABLE cargo ADD CONSTRAINT fk_cargo_order
                  FOREIGN KEY (order_id) REFERENCES "order"(id);
              ALTER TABLE cargo ADD CONSTRAINT fk_cargo_package
                  FOREIGN KEY (package_id) REFERENCES package(id);
              ALTER TABLE location ADD CONSTRAINT fk_location_route
                  FOREIGN KEY (route_id) REFERENCES route(id);
              ALTER TABLE location ADD CONSTRAINT fk_location_client
                  FOREIGN KEY (client_id) REFERENCES client(id);
              ALTER TABLE "order" ADD CONSTRAINT fk_order_origin_location
                  FOREIGN KEY (origin_location_id) REFERENCES location(id);
              ALTER TABLE "order" ADD CONSTRAINT fk_order_destination_location
                  FOREIGN KEY (destination_location_id) REFERENCES location(id);
              ALTER TABLE "order" ADD CONSTRAINT fk_order_cargo
                  FOREIGN KEY (cargo_id) REFERENCES cargo(id);
              ALTER TABLE "order" ADD CONSTRAINT fk_order_route
                  FOREIGN KEY (route_id) REFERENCES route(id);
              ALTER TABLE package ADD CONSTRAINT fk_package_cargo
                  FOREIGN KEY (cargo_id) REFERENCES cargo(id);
       `
      const tables = await this.query(getTablesQuery)
      // default table 'order' in public postgres schema contains indexes
      if (tables.rowCount === 1) {
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
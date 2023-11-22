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
      ret = queryRes;
      client.release()
      return ret;
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
            CREATE TABLE IF NOT EXISTS truck (
                id SERIAL PRIMARY KEY,
                max_weight INT,
                max_volume INT,
                cpm INT,
                avg_spd INT,
                type VARCHAR(255),
                autonomy VARCHAR(255)
            );
            CREATE TABLE IF NOT EXISTS route (
                id SERIAL PRIMARY KEY,
                truck_id INT,
                max_time INT,
                profitability INT
            );
            CREATE TABLE IF NOT EXISTS location (
                id SERIAL PRIMARY KEY,
                latitude NUMERIC,
                longitude NUMERIC
            );
            CREATE TABLE IF NOT EXISTS stop (
                id SERIAL PRIMARY KEY,
                location_id INT,
                drop_time INT,
                previous_stop_id INT,
                next_stop_id INT,
                route_id INT
            );
            CREATE TABLE IF NOT EXISTS client (
                id SERIAL PRIMARY KEY,
                company_name VARCHAR(255),
                company_client_id INT
            );
            CREATE TABLE IF NOT EXISTS request (
                id SERIAL PRIMARY KEY,
                client_id INT,
                route_id INT,
                origin_stop_id INT,
                destination_stop_id INT,
                contract_type VARCHAR(255)
            );
            CREATE TABLE IF NOT EXISTS packagetype (
                id SERIAL PRIMARY KEY,
                volume INT,
                weight INT,
                name VARCHAR(255)
            );
            CREATE TABLE IF NOT EXISTS package (
                id SERIAL PRIMARY KEY,
                request_id INT,
                packagetype_id INT
            );
        `;

        const foreignKeyQueries = `
            ALTER TABLE route ADD CONSTRAINT fk_route_truck
                FOREIGN KEY (truck_id) REFERENCES truck(id);
            ALTER TABLE stop ADD CONSTRAINT fk_stop_location
                FOREIGN KEY (location_id) REFERENCES location(id);
            ALTER TABLE stop ADD CONSTRAINT fk_stop_previous_stop
                FOREIGN KEY (previous_stop_id) REFERENCES stop(id);
            ALTER TABLE stop ADD CONSTRAINT fk_stop_next_stop
                FOREIGN KEY (next_stop_id) REFERENCES stop(id);
            ALTER TABLE stop ADD CONSTRAINT fk_stop_route
                FOREIGN KEY (route_id) REFERENCES route(id);
            ALTER TABLE request ADD CONSTRAINT fk_request_client
                FOREIGN KEY (client_id) REFERENCES client(id);
            ALTER TABLE request ADD CONSTRAINT fk_request_route
                FOREIGN KEY (route_id) REFERENCES route(id);
            ALTER TABLE request ADD CONSTRAINT fk_request_origin_stop
                FOREIGN KEY (origin_stop_id) REFERENCES stop(id);
            ALTER TABLE request ADD CONSTRAINT fk_request_destination_stop
                FOREIGN KEY (destination_stop_id) REFERENCES stop(id);
            ALTER TABLE package ADD CONSTRAINT fk_package_request
                FOREIGN KEY (request_id) REFERENCES request(id);
            ALTER TABLE package ADD CONSTRAINT fk_package_packagetype
                FOREIGN KEY (packagetype_id) REFERENCES packagetype(id);
        `;
      let tables = await this.query(getTablesQuery);
      // if new database, instantiate with the requisite tables
      if (tables.rowCount === 0) {
        try {
          await this.query(tableQueries)
          await this.query(foreignKeyQueries);
        } catch (e: any) {
          console.error(e);
          return e;
        }
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

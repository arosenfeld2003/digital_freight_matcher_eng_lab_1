import DB from '../db/db'

let db: DB;
describe('DB Tests', () => {
	beforeAll(async() => {
		db = DB.getInstance()
	})

	afterAll(async() => {
		await DB.closePool()
	})

	it('should instantiate the DB with correct tables', async () => {
		const hasTables = await db.createTables()
		expect(hasTables).toBeTruthy()

		const tables = await db.query(`SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'`)
		expect(tables.rowCount).toEqual(7)
		expect(tables.rows).toEqual( [
				{ tablename: 'order' },
				{ tablename: 'truck' },
				{ tablename: 'cargo' },
				{ tablename: 'package' },
				{ tablename: 'route' },
				{ tablename: 'location' },
				{ tablename: 'client' }
			],
		)
	})
})

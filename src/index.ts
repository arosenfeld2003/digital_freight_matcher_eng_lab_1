import express from 'express'
import DB from './db/db'
import bodyParser from 'body-parser'
import morgan from 'morgan'
import dotenv from 'dotenv'
import * as process from 'process'

const app = express()
dotenv.config() // Load environment variables from .env file

// Configure morgan to log requests
app.use(morgan('dev'))

// Parse JSON request bodies
app.use(bodyParser.json())

// Instantiate the DB
const db = DB.getInstance()
if (db !== undefined) {
  void db.createTables().then(val => {
    // Test the database connection
    if (val === true) {
      console.log('DB successfully instantiated')
    } else {
      console.error(val)
    }
  })
}

// Define routes and CRUD operations...

// Start your Express server
const port = process.env.PG_PORT
app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})

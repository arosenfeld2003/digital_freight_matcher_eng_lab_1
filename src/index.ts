import express from 'express'
import { Pool } from 'pg'
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

// Create a PostgreSQL connection pool
const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DB,
  password: process.env.PG_PW,
  port: Number(process.env.PG_PORT)
})

// Test the database connection
pool.connect((err, client, done) => {
  if (err !== undefined) {
    console.error('Error connecting to the database', err)
  } else {
    console.log('Connected to the database')
  }
})

// Define your routes and CRUD operations here

// Start your Express server
const port = process.env.PG_PORT
app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})

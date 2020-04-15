const mongoose = require('mongoose')

require('dotenv').config()

const server = 'localhost'
const database = 'dating'
const uristring = process.env.MONGODB_URI || `mongodb://${server}/${database}`

class Database {
  constructor() {
    this.connect()
  }

  connect() {
    mongoose
      .connect(uristring, { useNewUrlParser: true })
      .then(() => {
        // mongoose.connection.db.dropDatabase();
        console.log('Database connection successful: ' + uristring)
      })
      .catch(err => {
        console.error('Database connection error: ' + uristring)
        console.error(err)
      })
  }
}

module.exports = new Database()

// Limit requests to max 5 per second
const { RateLimiterMongo } = require('rate-limiter-flexible')
require('dotenv').config({ path: '.env' })

const mongoOpts = {
  useNewUrlParser: true,
  reconnectTries: Number.MAX_VALUE, // Won't stop trying to reconnect
  reconnectInterval: 100, // Reconnect every 100ms
}

mongoose.connect(uristring, mongoOpts).catch(err => {})
const mongoConn = mongoose.connection

const opts = {
  storeClient: mongoConn,
  points: 5, // Number of allowed requests by user
  duration: 1, // Max 5 requests per second
}

const rateLimiterMongo = new RateLimiterMongo(opts)
rateLimiterMongo
  .consume(remoteAddress, 1) // Consume 1 point on request
  .then(rateLimiterRes => {
    console.log('1 point consumed')
  })
  .catch(rateLimiterRes => {
    res.status(429).send('Too many requests')
  })

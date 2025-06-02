const express = require('express')
const morgan = require('morgan')

const api = require('./api')
const { connectToDb } = require('./lib/mongo')
const { connectToRabbitMq } = require('./lib/rabbitmq')
const { startConsumer } = require('./thumbnail-consumer')

const app = express()
const port = process.env.PORT || 8000

async function startServer() {
  
  await connectToRabbitMq()

  startConsumer()

  /*
  * Morgan is a popular logger.
  */
  app.use(morgan('dev'))

  app.use(express.json())
  app.use(express.static('public'))

  /*
  * All routes for the API are written in modules in the api/ directory.  The
  * top-level router lives in api/index.js.  That's what we include here, and
  * it provides all of the routes.
  */
  app.use('/', api)

  app.use('*', function (req, res, next) {
    res.status(404).json({
      error: "Requested resource " + req.originalUrl + " does not exist"
    })
  })

  connectToDb(function () {
    app.listen(port, function () {
      console.log("== Server is running on port", port)
    })
  })

}

startServer()
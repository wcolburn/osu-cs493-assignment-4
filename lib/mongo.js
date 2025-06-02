/*
 * Module for working with a MongoDB connection.
 */

const { MongoClient, GridFSBucket } = require('mongodb')

const mongoHost = process.env.MONGO_HOST || 'localhost'
const mongoPort = process.env.MONGO_PORT || 27017
const mongoUser = process.env.MONGO_USER
const mongoPassword = process.env.MONGO_PASSWORD
const mongoDbName = process.env.MONGO_DB_NAME
const mongoAuthDbName = process.env.MONGO_AUTH_DB_NAME || mongoDbName

const mongoUrl = `mongodb://${mongoUser}:${mongoPassword}@${mongoHost}:${mongoPort}/${mongoAuthDbName}`

let db = null
let gfs_bucket = null
let thumbs_bucket = null
let _closeDbConnection = null
exports.connectToDb = function (callback) {
  MongoClient.connect(mongoUrl, function (err, client) {
    if (err) {
      throw err
    }
    db = client.db(mongoDbName)
    gfs_bucket = new GridFSBucket(db, { bucketName: 'uploads' });
    thumbs_bucket = new GridFSBucket(db, {bucketName: 'thumbs'})
    _closeDbConnection = function () {
      client.close()
    }
    callback()
  })
}

exports.getDbReference = function () {
  return db
}

exports.closeDbConnection = function (callback) {
  _closeDbConnection(callback)
}

exports.getMongoUrl = function () {
  return mongoUrl
}

exports.getGfsBucket = function () {
  return gfs_bucket
}

exports.getThumbsGfsBucket = function () {
  return thumbs_bucket
}
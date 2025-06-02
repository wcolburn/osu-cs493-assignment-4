/*
 * Photo schema and data accessor methods.
 */

const { ObjectId } = require('mongodb')

const { getDbReference, getThumbsGfsBucket } = require('../lib/mongo')
const { getChannel } = require('../lib/rabbitmq')
const { extractValidFields } = require('../lib/validation')
const { getGfsBucket } = require('../lib/mongo')

/*
 * Schema describing required/optional fields of a photo object.
 */
const PhotoSchema = {
  businessId: { required: true },
  caption: { required: false }
}
exports.PhotoSchema = PhotoSchema

const mimeType = {
  "image/png": ".png",
  "image/jpg": ".jpg",
}
exports.mimeType = mimeType

/*
 * Executes a DB query to insert a new photo into the database.  Returns
 * a Promise that resolves to the ID of the newly-created photo entry.
 */
async function insertNewPhoto(photo) {
  photo = extractValidFields(photo, PhotoSchema)
  photo.businessId = ObjectId(photo.businessId)
  const db = getDbReference()
  const collection = db.collection('photos')
  const result = await collection.insertOne(photo)
  return result.insertedId
}
exports.insertNewPhoto = insertNewPhoto

/*
 * Executes a DB query to fetch a single specified photo based on its ID.
 * Returns a Promise that resolves to an object containing the requested
 * photo.  If no photo with the specified ID exists, the returned Promise
 * will resolve to null.
 */
async function getPhotoById(id) {

  const db = getDbReference()

  if (!ObjectId.isValid(id)) {
    return null
  } else {

    const photo_id = new ObjectId(id);

    const file = await db.collection('uploads.files')
    .findOne({ _id: photo_id });

    if (!file) {
      return null;
    } else {
      return file;
    }

  }
}
exports.getPhotoById = getPhotoById

async function getThumbnailById(id) {
  const db = getDbReference()

  if (!ObjectId.isValid(id)) {
    return null
  } else {

    const thumb_id = new ObjectId(id);

    const file = await db.collection('thumbs.files')
    .findOne({ _id: thumb_id });

    if (!file) {
      return null;
    } else {
      return file;
    }

  }

}
exports.getThumbnailById = getThumbnailById

async function getPhotoByName(file_name) {
  // Get the file from the db
  const db = getDbReference()
  const file = await db.collection('uploads.files')
      .findOne({ filename: file_name });

  if (!file) {
    return null;
  } else {
    console.log(file)
    return file;
  }
}
exports.getPhotoByName = getPhotoByName

async function setMetadata(businessId, caption, photo_id) {
  const db = getDbReference()
  await db.collection('uploads.files').updateOne(
    { _id: photo_id },
    { $set: {
      metadata: {
        businessId: businessId,
        caption: caption
      }
    }}
  );
}
exports.setMetadata = setMetadata


async function generateThumbnail(photo_id) {
  const channel = getChannel()
  console.log("Generating thumbnail...")
  await channel.assertQueue('thumbnail');
  console.log("Queue established!")
  channel.sendToQueue('thumbnail', Buffer.from(photo_id.toString()))
}
exports.generateThumbnail = generateThumbnail


async function createPhotoDownloadStream(photo_id) {
      // Create stream
      const gfs_bucket = getGfsBucket()
      const download_stream = gfs_bucket.
          openDownloadStream(photo_id);
      download_stream.on('error', err => {
          res.status(400).send(`Error: ${err}`);
      });
    return download_stream;
}
exports.createPhotoDownloadStream = createPhotoDownloadStream

async function createThumbnailDownloadStream(photo_id) {
      // Create stream
      const gfs_bucket = getThumbsGfsBucket()
      const download_stream = gfs_bucket.
          openDownloadStream(photo_id);
      download_stream.on('error', err => {
          res.status(400).send(`Error: ${err}`);
      });
    return download_stream;
}
exports.createThumbnailDownloadStream = createThumbnailDownloadStream

async function addThumbnailToMetadata(photo_id, thumb_id) {
  console.log("Gonna add the thumbnail!")
  const db = getDbReference()
  await db.collection('uploads.files').updateOne(
    { _id: photo_id },
    { $set: {
      'metadata.thumbId': thumb_id
    }}
  );
}
exports.addThumbnailToMetadata = addThumbnailToMetadata
/*
 * API sub-router for businesses collection endpoints.
 */

const { Router } = require('express')
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const { getMongoUrl, getGfsBucket } = require('../lib/mongo')

// Verify upload file type
const filter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const storage = new GridFsStorage({
    url: getMongoUrl(),   // Same as the Mongo connect URL you use
    file: (req, file) => {
        return {
            filename: file.originalname,
            bucketName: 'uploads',
            metadata: {
              "businessId": req.body.businessId,
              "caption": req.body.caption
            }
        };
    },
});

const upload = multer({ storage, fileFilter: filter });

const { validateAgainstSchema } = require('../lib/validation')
const {
  PhotoSchema,
  getPhotoByName,
  getPhotoById,
  setMetadata,
  mimeType,
  generateThumbnail,
} = require('../models/photo')

const router = Router()

/*
 * POST /photos - Route to create a new photo.
 */
router.post('/', upload.single('file'), async (req, res) => {

  if (validateAgainstSchema(req.body, PhotoSchema)) {
    try {

      // If the filter refuses to upload the file due to an incorrect exension, this makes sure to send status 400
      if (!req.file) {
        return res.status(400).send({ error: 'No file uploaded. Make sure it is of type jpeg or png.' });
      }

      setMetadata(req.body.businessId, req.body.caption, req.file.id)

      generateThumbnail()

      // Otherwise, the file uploaded successfully!
      res.status(201).send({"id": req.file.id})

    } catch (err) {
      console.error(err)
      res.status(500).send({
        error: "Error inserting photo into DB.  Please try again later."
      })
    }
  } else {
    res.status(400).send({
      error: "Request body is not a valid photo object"
    })
  }
})

/*
 * GET /photos/{filename} - Route to fetch info about a specific photo.
 */
router.get('/:id', async (req, res, next) => {
  try {
    // const photo = await getPhotoByName(req.params.id)
    const photo = await getPhotoById(req.params.id)
    if (!photo) {
      return res.status(404).send('Not found');
    }

    console.log(photo)

    // Send the res
    res.status(200)
    res.send({
      "_id": photo._id,
      "businessId": photo.metadata.businessId,
      "caption": photo.metadata.caption,
      "download": "/media/photos/" + photo._id + mimeType[photo.contentType]
    })

  } catch (err) {
    console.error(err)
    res.status(500).send({
      error: "Unable to fetch photo.  Please try again later."
    })
  }
})

module.exports = router

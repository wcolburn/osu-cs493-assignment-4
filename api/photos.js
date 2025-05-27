/*
 * API sub-router for businesses collection endpoints.
 */

const { Router } = require('express')
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');

// Verify upload file type
const filter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const storage = new GridFsStorage({
    url: mongoURL,   // Same as the Mongo connect URL you use
    file: (req, file) => {
        return {
            filename: file.originalname,
            bucketName: 'uploads',
            metaData: {
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

      // Otherwise, the file uploaded successfully!
      res.status(201).send({"success": "Data uploaded successfully"})

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
router.get('/:filename', async (req, res, next) => {
  try {
    const photo = await getPhotoByName(req.params.filename)
    if (!photo) {
      return res.status(404).send('Not found');
    }

    // Create stream
    const download_stream = gfs_bucket.
        openDownloadStreamByName(req.params.filename);
    download_stream.on('error', err => {
        res.status(400).send(`Error: ${err}`);
    });

    // Send the res
    res.status(200)
    res.type(file.contentType)
    download_stream.pipe(res);

  } catch (err) {
    console.error(err)
    res.status(500).send({
      error: "Unable to fetch photo.  Please try again later."
    })
  }
})

module.exports = router

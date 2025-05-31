const { Router } = require('express')
const { getGfsBucket } = require('../lib/mongo')

const {
  getPhotoById,
} = require('../models/photo')

const router = Router()

router.get('/photos/:id', async (req, res, next) => {
  try {

    const photo = await getPhotoById(req.params.id)
    if (!photo) {
      return res.status(404).send('Not found');
    }

    // Create stream
    const gfs_bucket = getGfsBucket()
    const download_stream = gfs_bucket.
        openDownloadStream(photo._id);
    download_stream.on('error', err => {
        res.status(400).send(`Error: ${err}`);
    });

    // Send the res
    res.status(200)
    res.type(photo.contentType)
    download_stream.pipe(res);

  } catch (err) {
    console.error(err)
    res.status(500).send({
      error: "Unable to fetch photo.  Please try again later."
    })
  }
})

module.exports = router
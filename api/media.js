const { Router } = require('express')
const { getGfsBucket } = require('../lib/mongo')

const {
  getPhotoById,
  createPhotoDownloadStream,
} = require('../models/photo')

const router = Router()

router.get('/photos/:id', async (req, res, next) => {
  try {

    id = req.params.id.split(".")[0]

    const photo = await getPhotoById(id)
    if (!photo) {
      return res.status(404).send('Not found');
    }

    // Create stream
    const download_stream = await createPhotoDownloadStream(photo);

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
const amqp = require('amqplib');
const rabbitmqHost = process.env.RABBITMQ_HOST || 'rabbitmq';
const rabbitmqUrl = `amqp://${rabbitmqHost}`;
const { Jimp } = require("jimp");
const { getPhotoById, createPhotoDownloadStream } = require('./models/photo');
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const { getMongoUrl, getThumbsGfsBucket } = require('./lib/mongo')

const storage = new GridFsStorage({
    url: getMongoUrl(),   // Same as the Mongo connect URL you use
    file: (req, file) => {
        return {
            filename: file.originalname,
            bucketName: 'thumbs'
        };
    },
});

const upload = multer({ storage });

async function startConsumer() {
    try {
        const connection = await amqp.connect(rabbitmqUrl);
        const channel = await connection.createChannel();
        console.log("Starting consumer!")
        await channel.assertQueue('thumbnail');

        channel.consume('thumbnail', async (msg) => {
            console.log("CONSUMER HERE")
            // msg can be null if something goes awry
            if (msg) {
                // msg.content Buffer converted to String
                console.log("Photo id:" + msg.content.toString());

                const photo = await getPhotoById(msg.content.toString())
                if (!photo) {
                    console.log("No photo found! Error!");
                    throw err;
                }

                const stream = await createPhotoDownloadStream(photo._id)

                const imageData = [];
                stream.on('data', (data) => {
                    imageData.push(data);
                });

                stream.on('end', async () => {
                try {
                    const buffer = Buffer.concat(imageData);

                    console.log('Image buffer length:', buffer.length);

                    const image = await Jimp.read(buffer);

                    // image.resize(100, 100);

                    const image_buffer = await image.getBufferAsync(Jimp.MIME_JPEG);

                    console.log("Buffer created!")

                    const bucket = getThumbsGfsBucket();
                    const upload_stream = bucket.openUploadStream(photo._id);
                    upload_stream.end(image_buffer);

                    upload_stream.on('finish', () => {
                    console.log('Thumbnail uploaded successfully');
                    });

                    upload_stream.on('error', (err) => {
                    console.error('Error uploading thumbnail:', err);
                    });
                } catch (err) {
                    console.error('Failed to process image buffer:', err);
                }
                });


            }

            // Tell RabbitMQ it's OK to remove this message from the queue
            channel.ack(msg);
        });
    } catch (err) {
        console.error(err);
    }
}

exports.startConsumer = startConsumer
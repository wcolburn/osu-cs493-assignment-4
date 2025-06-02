const amqp = require('amqplib');
const rabbitmqHost = process.env.RABBITMQ_HOST || 'rabbitmq';
const rabbitmqUrl = `amqp://${rabbitmqHost}`;

async function startConsumer() {
    try {
        const connection = await amqp.connect(rabbitmqUrl);
        const channel = await connection.createChannel();
        console.log("Starting consumer!")
        await channel.assertQueue('thumbnail');

        channel.consume('thumbnail', (msg) => {
            console.log("CONSUMER HERE")
            // msg can be null if something goes awry
            if (msg) {
                // msg.content Buffer converted to String
                console.log("Photo id:" + msg.content.toString());
            }

            // Tell RabbitMQ it's OK to remove this message from the queue
            channel.ack(msg);
        });
    } catch (err) {
        console.error(err);
    }
}

exports.startConsumer = startConsumer
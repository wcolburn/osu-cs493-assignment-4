const amqp = require('amqplib');
const rabbitmqHost = process.env.RABBITMQ_HOST || 'rabbitmq';
const rabbitmqUrl = `amqp://${rabbitmqHost}`;

let channel = null;

async function connectToRabbitMq() {

    while (true) {
  try {
  
    const connection = await amqp.connect(rabbitmqUrl);
    channel = await connection.createChannel();
    break;

  } catch (err) {
    console.error(err);
    throw err;
  }
}
}
exports.connectToRabbitMq = connectToRabbitMq

exports.getChannel = function () {
  return channel
}
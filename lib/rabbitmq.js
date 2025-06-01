const amqp = require('amqplib');
const rabbitmqHost = process.env.RABBITMQ_HOST || 'localhost';;
const rabbitmqUrl = `amqp://${rabbitmqHost}`;

let channel = null;

async function connectToRabbitMq() {
  try {
  
    const connection = await amqp.connect(rabbitmqUrl);
    channel = await connection.createChannel();

  } catch (err) {
    console.error(err);
  }
}
exports.connectToRabbitMq = connectToRabbitMq

exports.getChannel = function () {
  return channel
}
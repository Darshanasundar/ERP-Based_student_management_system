const amqp = require('amqplib');

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@127.0.0.1:5672';
const QUEUE_NAME = 'risk_assessment_queue';

let connection = null;
let channel = null;
let isConnecting = false;

async function connectRabbitMQ() {
  if (channel) return channel;
  if (isConnecting) return null;

  isConnecting = true;
  try {
    connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();

    // Ensure queue is durable so messages persist through broker restarts
    await channel.assertQueue(QUEUE_NAME, { durable: true });

    connection.on('error', (err) => {
      console.warn('RabbitMQ connection error:', err.message);
      channel = null;
      connection = null;
    });

    connection.on('close', () => {
      console.warn('RabbitMQ connection closed. Reconnecting in 3s...');
      channel = null;
      connection = null;
      setTimeout(connectRabbitMQ, 3000);
    });

    console.log(`RabbitMQ connected. Queue '${QUEUE_NAME}' ready for asynchronous risk assessment.`);
    isConnecting = false;
    return channel;
  } catch (err) {
    console.warn('RabbitMQ connection error (retrying in 5s):', err.message);
    channel = null;
    connection = null;
    isConnecting = false;
    setTimeout(connectRabbitMQ, 5000);
    return null;
  }
}

/**
 * Publish student academic payload to risk_assessment_queue
 */
async function publishRiskAssessment(payload) {
  try {
    if (!channel) {
      await connectRabbitMQ();
    }

    if (!channel) {
      console.warn('RabbitMQ channel unavailable. Dropping or logging message:', payload);
      return false;
    }

    const messageBuffer = Buffer.from(JSON.stringify(payload));
    const published = channel.sendToQueue(QUEUE_NAME, messageBuffer, {
      persistent: true,
      contentType: 'application/json',
      timestamp: Date.now(),
    });

    console.log(`Published payload for student ${payload.student_id} to '${QUEUE_NAME}'.`);
    return published;
  } catch (err) {
    console.error('Error publishing to RabbitMQ queue:', err.message);
    return false;
  }
}

module.exports = {
  connectRabbitMQ,
  publishRiskAssessment,
  QUEUE_NAME,
};

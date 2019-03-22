const amqp = require('amqplib');
const winston = require('winston');

module.exports.queueJob = async (taskName, params) => {
  
  // Connect to RabbitMQ
    const connection = await amqp.connect(process.env.MESSAGE_QUEUE);
    const channel = await connection.createChannel();

    // Celery is default queue name with celery
    await channel.assertQueue('celery', { durable: true });

    // Create task
    const task = { task: taskName, args: [params], id: '1' };
    
    // Send to RabbitMQ
    // await channel.sendToQueue('celery', Buffer.from(JSON.stringify(task)), {
    await channel.sendToQueue('celery', Buffer.from(JSON.stringify(task)), {
      contentType: 'application/json',
    });

    winston.info(`Task sent!`);
  
    setTimeout(() => {
      connection.close();
    }, 3000);
  };
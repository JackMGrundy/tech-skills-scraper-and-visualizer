const amqp = require('amqplib');
const winston = require('winston');

module.exports.start = async () => {
    const connection = await amqp.connect(process.env.MESSAGE_QUEUE);
  
    const channel = await connection.createChannel();
    await channel.assertQueue('celery', { durable: true });
  
    Array(1)
      .fill()
      .map(async (x, y) => {
        const task = { task: 'tasks', args: ["aafafadfa"], id: '1' };
  
        await channel.sendToQueue('celery', Buffer.from(JSON.stringify(task)), {
          contentType: 'application/json',
        });
  
        winston.info(`Task ${y} sent!`);
      });
  
    setTimeout(() => {
      connection.close();
    }, 3000);
  };
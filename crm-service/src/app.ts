import dotenv from 'dotenv';
import { startKafkaConsumer } from './kafka/consumer.js';

dotenv.config();

async function start(): Promise<void> {
  try {
    await startKafkaConsumer();
    console.log('CRM service is running and consuming Kafka messages');
  } catch (error) {
    console.error('Failed to start CRM service:', error);
    process.exit(1);
  }
}

start();

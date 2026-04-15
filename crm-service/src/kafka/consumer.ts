import dotenv from 'dotenv';
import { Kafka, logLevel, type Consumer } from 'kafkajs';
import { sendWelcomeEmail } from '../services/emailService.js';
import type { CustomerRegisteredEvent } from '../types/customerRegisteredEvent.js';

dotenv.config();

const brokers = (process.env.KAFKA_BROKERS ?? '')
  .split(',')
  .map((broker) => broker.trim())
  .filter((broker) => broker.length > 0);

const clientId = process.env.KAFKA_CLIENT_ID ?? 'crm-service';
const groupId = process.env.KAFKA_GROUP_ID ?? 'crm-service-group-v2';
const topic = process.env.KAFKA_TOPIC;

function validateKafkaConfig(): void {
  if (brokers.length === 0) {
    throw new Error('Missing KAFKA_BROKERS');
  }
  if (!topic) {
    throw new Error('Missing KAFKA_TOPIC');
  }
}

function isCustomerRegisteredEvent(value: unknown): value is CustomerRegisteredEvent {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const event = value as Record<string, unknown>;

  return (
    typeof event.id === 'number' &&
    typeof event.userId === 'string' &&
    typeof event.name === 'string' &&
    typeof event.phone === 'string' &&
    typeof event.address === 'string' &&
    (typeof event.address2 === 'string' || event.address2 === null) &&
    typeof event.city === 'string' &&
    typeof event.state === 'string' &&
    typeof event.zipcode === 'string'
  );
}

export async function startKafkaConsumer(): Promise<Consumer> {
  validateKafkaConfig();

  const kafka = new Kafka({
    clientId,
    brokers,
    logLevel: logLevel.NOTHING,
  });

  const consumer = kafka.consumer({ groupId });

  console.log('Connecting CRM consumer to brokers:', brokers);
  console.log('Subscribing to topic:', topic);

  await consumer.connect();
  await consumer.subscribe({ topic: topic!, fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ message }) => {
      if (!message.value) {
        return;
      }

      const raw = message.value.toString();
      const parsed = JSON.parse(raw) as unknown;
      console.log('Received customer registered event:', parsed);

      if (!isCustomerRegisteredEvent(parsed)) {
        throw new Error('Invalid customer registered event payload');
      }

      await sendWelcomeEmail(parsed);
    },
  });

  return consumer;
}

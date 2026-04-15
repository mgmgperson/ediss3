import dotenv from 'dotenv';
import { Kafka, type Producer } from 'kafkajs';
import type { CustomerRegisteredEvent } from '../types/customerRegisteredEvent.js';

dotenv.config();

const brokers = (process.env.KAFKA_BROKERS ?? '')
  .split(',')
  .map((broker) => broker.trim())
  .filter((broker) => broker.length > 0);

const clientId = process.env.KAFKA_CLIENT_ID ?? 'customer-service';
const topic = process.env.KAFKA_TOPIC;

let producer: Producer | null = null;
let connectingPromise: Promise<Producer> | null = null;

function getKafka(): Kafka {
  if (brokers.length === 0) {
    throw new Error('Missing KAFKA_BROKERS');
  }

  return new Kafka({
    clientId,
    brokers,
  });
}

async function getProducer(): Promise<Producer> {
  if (producer) {
    return producer;
  }

  if (connectingPromise) {
    return connectingPromise;
  }

  connectingPromise = (async () => {
    const kafka = getKafka();
    const nextProducer = kafka.producer();
    await nextProducer.connect();
    producer = nextProducer;
    return nextProducer;
  })();

  try {
    return await connectingPromise;
  } finally {
    connectingPromise = null;
  }
}

export async function publishCustomerRegisteredEvent(
  event: CustomerRegisteredEvent
): Promise<void> {
  if (!topic) {
    throw new Error('Missing KAFKA_TOPIC');
  }

  const activeProducer = await getProducer();

  console.log('Publishing to Kafka topic:', topic, event);

  await activeProducer.send({
    topic,
    messages: [
      {
        key: event.userId,
        value: JSON.stringify(event),
      },
    ],
  });

  console.log('Kafka publish succeeded');
}

export async function disconnectKafkaProducer(): Promise<void> {
  if (!producer) {
    return;
  }

  await producer.disconnect();
  producer = null;
}

import { Redis } from 'ioredis';
import { Queue } from 'bullmq';
import { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD } from './config.js';

export const redisConnection = new Redis({
  host: REDIS_HOST, port: REDIS_PORT, password: REDIS_PASSWORD,
  maxRetriesPerRequest: null,  // REQUIRED — do not remove
});

export const executeFlowQueue = new Queue('execute_flow', { connection: redisConnection });

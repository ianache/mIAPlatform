import { Redis } from 'ioredis';
import { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD } from '../config.js';
// Separate Redis client for pub/sub (not shared with BullMQ connection)
const publisher = new Redis({ host: REDIS_HOST, port: REDIS_PORT, password: REDIS_PASSWORD });
export async function emitRunEvent(runId, event) {
    await publisher.publish(`flow_run:${runId}`, JSON.stringify(event));
}

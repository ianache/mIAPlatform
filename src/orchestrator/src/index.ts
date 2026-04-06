import { Worker } from 'bullmq';
import { redisConnection } from './queues.js';

console.log('Orchestrator starting...');

const worker = new Worker(
  'execute_flow',
  async (job) => {
    const { flowId, tenantId, runId } = job.data as { flowId: string; tenantId: string; runId: string };
    console.log(`[worker] received job — flowId=${flowId} runId=${runId}`);
    // TODO: Plan 03 will replace this stub with executeFlow(flowId, tenantId, runId)
    throw new Error('Engine not yet implemented — Plan 03 required');
  },
  { connection: redisConnection }
);

worker.on('completed', (job) => {
  console.log(`[worker] completed runId=${job.data.runId}`);
});

worker.on('failed', (job, err) => {
  console.error(`[worker] failed runId=${job?.data?.runId}`, err.message);
});

process.on('SIGTERM', async () => {
  await worker.close();
  process.exit(0);
});

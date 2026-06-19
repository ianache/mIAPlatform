import { Worker } from 'bullmq';
import { redisConnection } from '../queues.js';
import { executeFlow } from '../engine/executor.js';
export function createFlowWorker() {
    const worker = new Worker('execute_flow', async (job) => {
        const { flowId, tenantId, runId } = job.data;
        await executeFlow(flowId, tenantId, runId);
    }, { connection: redisConnection, concurrency: 5 });
    worker.on('completed', (job) => {
        console.log(`[worker] completed runId=${job.data.runId}`);
    });
    worker.on('failed', (job, err) => {
        console.error(`[worker] failed runId=${job?.data?.runId}`, err.message);
    });
    return worker;
}

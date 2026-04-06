import { createFlowWorker } from './workers/flowWorker.js';

console.log('Orchestrator starting...');

const worker = createFlowWorker();

process.on('SIGTERM', async () => {
  await worker.close();
  process.exit(0);
});

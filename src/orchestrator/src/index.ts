import { createFlowWorker } from './workers/flowWorker.js';
import { registerScheduledFlows } from './scheduler.js';

async function main() {
  console.log('Orchestrator starting...');
  await registerScheduledFlows();
  const worker = createFlowWorker();

  process.on('SIGTERM', async () => {
    await worker.close();
    process.exit(0);
  });
}

main().catch((err) => { console.error('Fatal:', err); process.exit(1); });

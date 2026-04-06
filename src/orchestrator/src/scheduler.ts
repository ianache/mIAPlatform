import { executeFlowQueue } from './queues.js';
import { pool } from './db/postgres.js';

interface ScheduledFlowConfig {
  flowId: string;
  tenantId: string;
  cronExpression: string;
}

async function findScheduledFlows(): Promise<ScheduledFlowConfig[]> {
  // Find flows that have a Source node with cron_expression in their graph
  const result = await pool.query(`
    SELECT f.id as flow_id, f.tenant_id,
           node->>'data' as node_data
    FROM mia.flows f,
         jsonb_array_elements(f.graph->'nodes') as node
    WHERE node->>'type' = 'source'
      AND (node->'data'->'config'->>'cron_expression') IS NOT NULL
  `);
  return result.rows.map(row => ({
    flowId: row.flow_id,
    tenantId: row.tenant_id,
    cronExpression: JSON.parse(row.node_data).config.cron_expression as string,
  }));
}

export async function registerScheduledFlows(): Promise<void> {
  const flows = await findScheduledFlows();
  for (const flow of flows) {
    await executeFlowQueue.upsertJobScheduler(
      `schedule:${flow.flowId}`,          // stable ID — upsert is idempotent
      { pattern: flow.cronExpression },
      { name: 'execute_flow', data: { flowId: flow.flowId, tenantId: flow.tenantId } }
    );
    console.log(`[scheduler] registered cron for flow ${flow.flowId}: ${flow.cronExpression}`);
  }
  if (flows.length === 0) {
    console.log('[scheduler] no scheduled flows found');
  }
}

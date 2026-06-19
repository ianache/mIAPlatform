import pg from 'pg';
import { DATABASE_URL } from '../config.js';
const { Pool } = pg;
export const pool = new Pool({ connectionString: DATABASE_URL });
export async function updateRunStatus(runId, status, finishedAt, finalOutput) {
    await pool.query(`UPDATE mia.flow_runs SET status=$1, finished_at=$2, final_output=$3 WHERE id=$4`, [status, finishedAt ?? null, finalOutput ? JSON.stringify(finalOutput) : null, runId]);
}
export async function appendRunLog(runId, event) {
    await pool.query(`UPDATE mia.flow_runs SET log = log || $1::jsonb WHERE id = $2`, [JSON.stringify([event]), runId]);
}

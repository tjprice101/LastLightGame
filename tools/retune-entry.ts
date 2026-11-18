/**
 * Runner entry for `node tools\run_pressure_study.mjs <out.jsonl> --retune` (identity control vs the
 * live calibration and any retune candidates) and `--retune-fit`. RETUNE_CANDIDATE may name a JSON calibration file to measure too.
 */
import { readFileSync } from 'node:fs';
import { authoredRadiantCalibration, liveRadiantCalibration, radiantRetuneCandidates, type RadiantEnemyCalibration } from '../src/content/enemy-calibration';
import { executeRadiantRetuneStudy } from './retune-study';

export function executeRetuneEntry(emit: (row: unknown) => void): void {
  const extra = process.env.RETUNE_CANDIDATE
    ? [JSON.parse(readFileSync(process.env.RETUNE_CANDIDATE, 'utf8')) as RadiantEnemyCalibration] : [];
  executeRadiantRetuneStudy(emit, [authoredRadiantCalibration, liveRadiantCalibration, ...radiantRetuneCandidates, ...extra]);
}
export { executeRetuneFit } from './retune-fit';

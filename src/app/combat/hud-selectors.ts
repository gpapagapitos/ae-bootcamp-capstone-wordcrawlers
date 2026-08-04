import type { EnemyIntent, RunState } from '../../engine/types.js';

export interface IntentPreviewItem {
  offset: number;
  intent: EnemyIntent;
}

export function getActionLogDisplayTurn(run: RunState): number {
  if (run.phase === 'prep' && run.turn > 1) {
    return run.turn - 1;
  }

  return run.turn;
}

export function getActionLogEntries(run: RunState): { turn: number; message: string }[] {
  const displayTurn = getActionLogDisplayTurn(run);
  const filtered = run.actionLog.filter((entry) => entry.turn === displayTurn);

  if (filtered.length > 0) {
    return filtered;
  }

  return run.actionLog.slice(-8);
}

export function getIntentPreview(run: RunState, count = 3): IntentPreviewItem[] {
  const intents = run.enemy.intents;
  if (intents.length === 0) {
    return [];
  }

  const start = run.enemy.intentIndex % intents.length;
  const preview: IntentPreviewItem[] = [];

  for (let offset = 0; offset < count; offset += 1) {
    preview.push({
      offset,
      intent: intents[(start + offset) % intents.length]
    });
  }

  return preview;
}

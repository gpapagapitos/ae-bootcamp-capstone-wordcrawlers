import { describe, expect, it } from 'vitest';
import { createInitialRunState } from '../../src/engine/state.js';
import { getActionLogDisplayTurn, getActionLogEntries, getIntentPreview } from '../../src/app/combat/hud-selectors.js';

describe('combat hud selectors', () => {
  it('uses previous turn in prep phase for action log display', () => {
    const run = createInitialRunState(7, 'duelist');
    run.turn = 4;
    run.phase = 'prep';

    expect(getActionLogDisplayTurn(run)).toBe(3);
  });

  it('filters log entries to current display turn when available', () => {
    const run = createInitialRunState(7, 'duelist');
    run.turn = 3;
    run.phase = 'spell';
    run.actionLog.push({ turn: 3, message: 'Turn three message' });
    run.actionLog.push({ turn: 2, message: 'Turn two message' });

    const entries = getActionLogEntries(run);

    expect(entries.every((entry) => entry.turn === 3)).toBe(true);
    expect(entries.some((entry) => entry.message.includes('Turn three'))).toBe(true);
  });

  it('returns rotating enemy intent preview', () => {
    const run = createInitialRunState(7, 'duelist');
    run.enemy.intentIndex = 3;

    const preview = getIntentPreview(run, 3);

    expect(preview.length).toBe(3);
    expect(preview[0].intent.type).toBe('charge');
    expect(preview[1].intent.type).toBe('attack');
  });
});

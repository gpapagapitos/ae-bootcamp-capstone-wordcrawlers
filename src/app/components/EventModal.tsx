import type { HeroId } from '../../engine/types.js';
import { describeBuff } from '../content/events.js';
import type { EventChoice, EventDef } from '../content/events.js';

interface EventModalProps {
  event: EventDef;
  heroId: HeroId;
  result: string | null;
  resultEffects: EventChoice | null;
  onChoose: (choiceId: string) => void;
  onContinue: () => void;
}

const CARD_EFFECT_LABELS: Record<NonNullable<EventChoice['cardEffect']>, string> = {
  addCard: 'Card Added',
  removeCard: 'Card Removed',
  upgradeCard: 'Card Upgraded',
  curseCard: 'Cursed Card Added'
};

function EventOutcomeStats({ effects }: { effects: EventChoice | null; }) {
  if (!effects) {
    return null;
  }

  const rows: { icon: string; text: string; tone: 'good' | 'bad' | 'neutral'; }[] = [];
  if (effects.deltaHp) {
    rows.push({ icon: '❤', text: `${effects.deltaHp > 0 ? '+' : ''}${effects.deltaHp} HP`, tone: effects.deltaHp > 0 ? 'good' : 'bad' });
  }
  if (effects.deltaBoon) {
    rows.push({ icon: '✦', text: `${effects.deltaBoon > 0 ? '+' : ''}${effects.deltaBoon} Boon`, tone: effects.deltaBoon > 0 ? 'good' : 'bad' });
  }
  if (effects.cardEffect) {
    rows.push({ icon: '❖', text: CARD_EFFECT_LABELS[effects.cardEffect], tone: effects.cardEffect === 'curseCard' ? 'bad' : 'good' });
  }
  if (effects.buff) {
    rows.push({ icon: '⚡', text: describeBuff(effects.buff), tone: 'neutral' });
  }

  if (rows.length === 0) {
    return null;
  }

  return (
    <div className="event-outcome-stats">
      {rows.map((row) => (
        <div key={row.text} className={`event-outcome-stat event-outcome-stat-${row.tone}`}>
          <span className="event-outcome-stat-icon" aria-hidden="true">{row.icon}</span>
          <span>{row.text}</span>
        </div>
      ))}
    </div>
  );
}

export function EventModal({ event, heroId, result, resultEffects, onChoose, onContinue }: EventModalProps) {
  const choices = event.choices.filter((choice) => !choice.heroOnly || choice.heroOnly === heroId);

  return (
    <div className="modal-overlay" role="presentation">
      <section className="event-scroll" role="dialog" aria-modal="true" aria-label="Event">
        <h2 className="event-scroll-title">{event.title}</h2>
        <p className="event-scroll-body">{event.description}</p>

        {result ? (
          <>
            <p className="event-scroll-result">{result}</p>
            <EventOutcomeStats effects={resultEffects} />
            <footer className="event-scroll-footer">
              <button className="event-scroll-button" onClick={onContinue}>
                Continue <span aria-hidden="true">➤</span>
              </button>
            </footer>
          </>
        ) : (
          <ul className="event-scroll-choices">
            {choices.map((choice) => (
              <li key={choice.id}>
                <button className="event-scroll-choice" onClick={() => onChoose(choice.id)}>
                  <span>{choice.label}</span>
                  <span className="event-scroll-choice-arrow" aria-hidden="true">➤</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

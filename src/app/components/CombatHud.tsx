import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { getEdge } from '../../engine/cards.js';
import type { Card, EnemyIntent, ItemDef } from '../../engine/types.js';
import { validateWordStrict } from '../../engine/word-validation.js';
import { getIntentPreview } from '../combat/hud-selectors.js';
import { isTutorialSeen, markTutorialSeen } from '../persistence/tutorial.js';
import { ENEMY_VOWEL_CARD_ID, useCombatStore, WILD_CARD_ID } from '../store/combatStore.js';
import { TutorialOverlay } from './TutorialOverlay.js';

interface CombatHudProps {
  encounterLabel: string;
  onBackToMap: () => void;
}

interface FloatingFx {
  id: number;
  target: 'hero' | 'enemy';
  text: string;
  kind: 'damage' | 'bigdamage' | 'heal' | 'block' | 'hex';
}

interface StatSnapshot {
  heroHp: number;
  heroBlock: number;
  enemyHp: number;
  enemyBlock: number;
  heroHex: number;
  enemyHex: number;
}

/** Card-by-card scoring reveal pace (Balatro-style), ms per card. */
const CARD_REVEAL_STEP_MS = 420;
/** Extra hold on the final tally before the clash actually lands. */
const FINAL_TALLY_HOLD_MS = 420;
/** Gap between the hero's strike landing and the enemy's response, so turns read as distinct beats. */
const ENEMY_BEAT_DELAY_MS = 700;

const INTENT_ICONS: Record<EnemyIntent['type'], string> = {
  attack: '\u2694',
  block: '\ud83d\udee1',
  hex: '\u2623',
  debuff: '\u2913',
  charge: '\u26a1'
};

function formatIntent(intent: EnemyIntent): string {
  switch (intent.type) {
    case 'attack':
      return `Attack for ${intent.value}`;
    case 'block':
      return `Gain ${intent.value} block`;
    case 'hex':
      return `Apply ${intent.value} hex`;
    case 'debuff':
      return `Debuff (-1 energy)`;
    case 'charge':
      return `Charge ${intent.value} power`;
    default:
      return 'Unknown intent';
  }
}

function formatIntentValue(intent: EnemyIntent): string {
  return intent.type === 'debuff' ? '-1 EN' : `${intent.value}`;
}

/** Icon + value summary for an item's effect, shown on the button instead of only in a tooltip. */
function formatItemEffect(effectType: ItemDef['effectType'], value: number): string {
  switch (effectType) {
    case 'gainHits':
      return `\u2694 +${value}`;
    case 'gainBlocks':
      return `\ud83d\udee1 +${value}`;
    case 'gainEnergy':
      return `\u26a1 +${value}`;
    case 'applyHex':
      return `\u2623 +${value}`;
    default:
      return `+${value}`;
  }
}

/** Compact "2⚔️ 1🛡️" style summary of one edge's non-zero stats (spec 009 R1). */
function formatEdge(card: Card, side: 'left' | 'right'): string {
  const edge = getEdge(card, side);
  const parts: string[] = [];
  if (edge.hits > 0) {
    parts.push(`${edge.hits}\u2694\uFE0F`);
  }
  if (edge.blocks > 0) {
    parts.push(`${edge.blocks}\ud83d\udee1\uFE0F`);
  }
  if (edge.energy > 0) {
    parts.push(`${edge.energy}\u26a1`);
  }
  return parts.length > 0 ? parts.join(' ') : '\u2013';
}

/** Shared card face markup so the word-builder rail shows the same card, not a flattened chip. */
function CardFace({ card, splay, compact }: { card: Card; splay: 'left' | 'right'; compact?: boolean; }) {
  return (
    <>
      {compact ? null : (
        <div className="hand-card-edges">
          <span
            className={`hand-card-index hand-card-index-left ${splay === 'left' ? 'active-edge' : ''}`}
            aria-label={`Left edge: ${formatEdge(card, 'left')}`}
          >
            {formatEdge(card, 'left')}
          </span>
          <span
            className={`hand-card-index hand-card-index-right ${splay === 'right' ? 'active-edge' : ''}`}
            aria-label={`Right edge: ${formatEdge(card, 'right')}`}
          >
            {formatEdge(card, 'right')}
          </span>
        </div>
      )}
      <p className="hand-letter">{card.letter.toUpperCase()}</p>
      {compact ? <span className="builder-slot-value">{formatEdge(card, splay)}</span> : null}
    </>
  );
}

/** Fanned hand-of-cards layout (tilt + arc lift per slot), similar to Slay the Spire's hand. */
function fanStyle(index: number, total: number): CSSProperties {
  const mid = (total - 1) / 2;
  const offset = index - mid;
  const step = Math.min(7, 26 / Math.max(total - 1, 1));
  const tilt = offset * step;
  const lift = -(Math.abs(offset) * 5);
  return {
    '--tilt': `${tilt}deg`,
    '--arc-lift': `${lift}px`,
    zIndex: index
  } as CSSProperties;
}

export function CombatHud({ encounterLabel, onBackToMap }: CombatHudProps) {
  const {
    run,
    composedCardIds,
    splay,
    wildLetter,
    lastError,
    beginSpellPhase,
    toggleComposedCard,
    setWildLetter,
    toggleWildCard,
    toggleEnemyVowelCard,
    useItem,
    undoComposedLetter,
    clearComposedWord,
    setSplay,
    submitComposedWord,
    passCurrentTurn,
    clearError,
    setError
  } = useCombatStore();


  const [fx, setFx] = useState<FloatingFx[]>([]);
  const [heroShake, setHeroShake] = useState(false);
  const [enemyShake, setEnemyShake] = useState(false);
  const [castPulse, setCastPulse] = useState(false);
  const [clashPulse, setClashPulse] = useState(false);
  const [impactShake, setImpactShake] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [resolveIndex, setResolveIndex] = useState(-1);
  const [runningTotal, setRunningTotal] = useState({ hits: 0, blocks: 0, energy: 0 });
  const [enemyBeatIntent, setEnemyBeatIntent] = useState<EnemyIntent | null>(null);
  const [castingItemId, setCastingItemId] = useState<string | null>(null);
  const fxIdRef = useRef(0);
  const prevStatsRef = useRef<StatSnapshot | null>(null);
  /** Set right before a turn-ending action (word submit / pass) so the effect below knows to
   * hold the enemy's response back a beat instead of showing both sides' fx at once. */
  const pendingTurnResolutionRef = useRef(false);
  const pendingIntentRef = useRef<EnemyIntent | null>(null);
  const [tutorialOpen, setTutorialOpen] = useState(() => !isTutorialSeen());
  const [menuOpen, setMenuOpen] = useState(false);

  const handleTutorialComplete = () => {
    markTutorialSeen();
    setTutorialOpen(false);
  };

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setMenuOpen((open) => !open);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!run) {
      return;
    }
    const prev = prevStatsRef.current;
    // Captured once per diff: true only when this state change came from a word submit / pass,
    // so we know to stagger the enemy's response instead of showing both sides' fx at once.
    const isTurnResolution = pendingTurnResolutionRef.current;
    pendingTurnResolutionRef.current = false;

    if (prev) {
      const heroHpDelta = run.hero.hp - prev.heroHp;
      const heroBlockDelta = run.hero.block - prev.heroBlock;
      const enemyHpDelta = run.enemy.hp - prev.enemyHp;
      const enemyBlockDelta = run.enemy.block - prev.enemyBlock;
      const heroHexDelta = run.hero.hex - prev.heroHex;
      const enemyHexDelta = run.enemy.hex - prev.enemyHex;
      const heroBigHitThreshold = Math.max(6, Math.round(run.hero.maxHp * 0.15));
      const enemyBigHitThreshold = Math.max(6, Math.round(run.enemy.maxHp * 0.15));

      const spawnFx = (entries: FloatingFx[]) => {
        if (entries.length === 0) {
          return;
        }
        setFx((current) => [...current, ...entries]);
        entries.forEach((item) => {
          window.setTimeout(() => {
            setFx((current) => current.filter((entry) => entry.id !== item.id));
          }, 900);
        });
      };

      // Beat 1: the hero's own strike/word landing on the enemy (+ block gained mid-word).
      const strikeFx: FloatingFx[] = [];
      let enemyBigHit = false;
      if (enemyHpDelta < 0) {
        const isBig = Math.abs(enemyHpDelta) >= enemyBigHitThreshold;
        enemyBigHit = isBig;
        strikeFx.push({ id: fxIdRef.current++, target: 'enemy', text: `${enemyHpDelta}`, kind: isBig ? 'bigdamage' : 'damage' });
      } else if (enemyHpDelta > 0) {
        strikeFx.push({ id: fxIdRef.current++, target: 'enemy', text: `+${enemyHpDelta}`, kind: 'heal' });
      }
      if (heroBlockDelta > 0) {
        strikeFx.push({ id: fxIdRef.current++, target: 'hero', text: `+${heroBlockDelta} Block`, kind: 'block' });
      }

      const playStrikeBeat = () => {
        if (strikeFx.length > 0) {
          setEnemyShake(true);
          window.setTimeout(() => setEnemyShake(false), 380);
          setClashPulse(true);
          window.setTimeout(() => setClashPulse(false), 480);
        }
        if (enemyBigHit) {
          setImpactShake(true);
          window.setTimeout(() => setImpactShake(false), 420);
        }
        spawnFx(strikeFx);
      };

      // Beat 2: the enemy's response (damage taken, enemy block/hex gained from its own intent).
      const retaliateFx: FloatingFx[] = [];
      let heroBigHit = false;
      if (heroHpDelta < 0) {
        const isBig = Math.abs(heroHpDelta) >= heroBigHitThreshold;
        heroBigHit = isBig;
        retaliateFx.push({ id: fxIdRef.current++, target: 'hero', text: `${heroHpDelta}`, kind: isBig ? 'bigdamage' : 'damage' });
      } else if (heroHpDelta > 0) {
        retaliateFx.push({ id: fxIdRef.current++, target: 'hero', text: `+${heroHpDelta}`, kind: 'heal' });
      }
      if (enemyBlockDelta > 0) {
        retaliateFx.push({ id: fxIdRef.current++, target: 'enemy', text: `+${enemyBlockDelta} Block`, kind: 'block' });
      }
      if (enemyHexDelta > 0) {
        retaliateFx.push({ id: fxIdRef.current++, target: 'enemy', text: `+${enemyHexDelta} Hex`, kind: 'hex' });
      }
      if (heroHexDelta > 0) {
        retaliateFx.push({ id: fxIdRef.current++, target: 'hero', text: `+${heroHexDelta} Hex`, kind: 'hex' });
      }

      const playRetaliateBeat = () => {
        setEnemyBeatIntent(null);
        if (retaliateFx.length > 0) {
          setHeroShake(true);
          window.setTimeout(() => setHeroShake(false), 380);
        }
        if (heroBigHit) {
          setImpactShake(true);
          window.setTimeout(() => setImpactShake(false), 420);
        }
        spawnFx(retaliateFx);
      };

      if (isTurnResolution) {
        playStrikeBeat();
        if (retaliateFx.length > 0) {
          setEnemyBeatIntent(pendingIntentRef.current);
          window.setTimeout(playRetaliateBeat, ENEMY_BEAT_DELAY_MS);
        }
      } else {
        // Not a turn-ending action (e.g. an item was cast) — no need to stagger.
        playStrikeBeat();
        playRetaliateBeat();
      }
    }
    prevStatsRef.current = {
      heroHp: run.hero.hp,
      heroBlock: run.hero.block,
      enemyHp: run.enemy.hp,
      enemyBlock: run.enemy.block,
      heroHex: run.hero.hex,
      enemyHex: run.enemy.hex
    };
  }, [run?.hero.hp, run?.hero.block, run?.enemy.hp, run?.enemy.block, run?.hero.hex, run?.enemy.hex]);

  useEffect(() => {
    if (run?.phase === 'prep') {
      beginSpellPhase();
    }
  }, [run?.phase, beginSpellPhase]);

  if (!run) {
    return null;
  }

  const intent = run.enemy.intents[run.enemy.intentIndex % run.enemy.intents.length] ?? null;
  const intentPreview = getIntentPreview(run, 3);

  const isVictory = run.enemy.hp <= 0;
  const isDefeat = run.hero.hp <= 0;
  const selectedIds = new Set(composedCardIds);
  const composedWord = composedCardIds
    .map((cardId) => {
      if (cardId === WILD_CARD_ID) {
        return wildLetter;
      }
      if (cardId === ENEMY_VOWEL_CARD_ID) {
        return run.enemy.weakVowel ?? '';
      }
      return run.deck.hand.find((card) => card.id === cardId)?.letter ?? '';
    })
    .join('')
    .toUpperCase();
  const canCompose = run.phase === 'spell' && !isVictory && !isDefeat && !resolving;
  const heroHpPct = Math.max(0, Math.min(100, (run.hero.hp / run.hero.maxHp) * 100));
  const enemyHpPct = Math.max(0, Math.min(100, (run.enemy.hp / run.enemy.maxHp) * 100));
  const heroFx = fx.filter((item) => item.target === 'hero');
  const enemyFx = fx.filter((item) => item.target === 'enemy');
  const showEnemyVowelSlot = run.enemyVowelAvailable || composedCardIds.includes(ENEMY_VOWEL_CARD_ID);
  const totalHandSlots = 1 + (showEnemyVowelSlot ? 1 : 0) + run.deck.hand.length;
  const needsWildLetter = composedCardIds.includes(WILD_CARD_ID) && !/^[a-z]$/i.test(wildLetter);
  const wordTotals = composedCardIds.reduce(
    (totals, cardId) => {
      const card = run.deck.hand.find((item) => item.id === cardId);
      if (!card) {
        return totals;
      }
      const edge = getEdge(card, splay);
      return {
        hits: totals.hits + edge.hits,
        blocks: totals.blocks + edge.blocks,
        energy: totals.energy + edge.energy
      };
    },
    { hits: 0, blocks: 0, energy: 0 }
  );

  const resolvingCardId = resolving && resolveIndex >= 0 ? composedCardIds[resolveIndex] : null;
  const resolvingCard = resolvingCardId ? run.deck.hand.find((item) => item.id === resolvingCardId) : null;
  const resolvingEdge = resolvingCard ? getEdge(resolvingCard, splay) : null;
  const wordIsValid = composedCardIds.length > 0 && !needsWildLetter && validateWordStrict(composedWord).valid;

  const handleSubmitWord = () => {
    if (resolving) {
      return;
    }
    if (!needsWildLetter) {
      const validation = validateWordStrict(composedWord);
      if (!validation.valid) {
        setError(validation.reason ?? 'Invalid word.');
        return;
      }
    }
    const ids = [...composedCardIds];
    setResolving(true);
    setResolveIndex(-1);
    setRunningTotal({ hits: 0, blocks: 0, energy: 0 });

    let index = 0;
    const revealNext = () => {
      if (index >= ids.length) {
        setResolveIndex(-1);
        setCastPulse(true);
        window.setTimeout(() => setCastPulse(false), 520);
        // Hold the final tally on screen a beat before the clash actually lands.
        window.setTimeout(() => {
          pendingTurnResolutionRef.current = true;
          pendingIntentRef.current = intent;
          submitComposedWord();
          // Keep the board locked through the enemy's staggered response beat.
          window.setTimeout(() => setResolving(false), ENEMY_BEAT_DELAY_MS + 260);
        }, FINAL_TALLY_HOLD_MS);
        return;
      }
      const cardId = ids[index];
      const card = run?.deck.hand.find((item) => item.id === cardId);
      if (card) {
        const edge = getEdge(card, splay);
        setRunningTotal((prev) => ({
          hits: prev.hits + edge.hits,
          blocks: prev.blocks + edge.blocks,
          energy: prev.energy + edge.energy
        }));
      }
      setResolveIndex(index);
      index += 1;
      window.setTimeout(revealNext, CARD_REVEAL_STEP_MS);
    };
    window.setTimeout(revealNext, CARD_REVEAL_STEP_MS);
  };

  const handlePassTurn = () => {
    if (resolving) {
      return;
    }
    pendingTurnResolutionRef.current = true;
    pendingIntentRef.current = intent;
    passCurrentTurn();
  };


  return (
    <div className="screen-root combat-layout">
      {tutorialOpen ? (
        <TutorialOverlay
          context={{ enemyVowelAvailable: run.enemyVowelAvailable }}
          onComplete={handleTutorialComplete}
        />
      ) : null}
      {menuOpen ? (
        <div className="combat-menu-overlay" role="dialog" aria-modal="true" aria-label="Game menu">
          <section className="panel combat-menu-panel">
            <p className="eyebrow">Ruin Encounter</p>
            <h2>{encounterLabel}</h2>
            <div className="combat-menu-actions">
              <button type="button" className="ink-button ink-button-primary" onClick={() => setMenuOpen(false)}>
                Resume
              </button>
              <button
                type="button"
                className="ink-button"
                onClick={() => {
                  setMenuOpen(false);
                  setTutorialOpen(true);
                }}
              >
                Replay Tutorial
              </button>
              <button type="button" className="ink-button" onClick={onBackToMap}>
                Back to Map
              </button>
            </div>
          </section>
        </div>
      ) : null}

      <section className={`battlefield-shell ${castPulse ? 'arena-cast' : ''} ${clashPulse ? 'arena-clash' : ''} ${impactShake ? 'arena-impact' : ''}`}>
        <section className="arena" aria-label="Battlefield">
          <div className="arena-scene">
            {resolving && (runningTotal.hits > 0 || runningTotal.blocks > 0) ? (
              <div className="arena-total-damage" key={`total-${resolveIndex}`}>
                <span className="arena-total-damage-value">{runningTotal.hits > 0 ? runningTotal.hits : runningTotal.blocks}</span>
                <span className="arena-total-damage-icon" aria-hidden="true">{runningTotal.hits > 0 ? '⚔' : '🛡'}</span>
              </div>
            ) : null}
            {enemyBeatIntent ? (
              <div className="enemy-beat-banner" role="status">
                <span className="enemy-beat-banner-icon" aria-hidden="true">{INTENT_ICONS[enemyBeatIntent.type]}</span>
                <span className="enemy-beat-banner-text">Enemy Turn — {formatIntent(enemyBeatIntent)}</span>
              </div>
            ) : null}
            <div className="arena-combatants">
              <div className={`combatant combatant-hero ${heroShake ? 'is-hit' : ''} ${run.phase === 'spell' ? 'is-active' : ''}`}>
                {heroFx.map((item) => (
                  <span key={item.id} className={`floating-fx floating-fx-${item.kind}`}>{item.text}</span>
                ))}
                <span className="combatant-banner combatant-banner-hero">Hero</span>
                <div className="combatant-portrait" aria-hidden="true">
                  <span className="portrait-glyph">⚔</span>
                </div>
                <div className={`stat-bar hp-bar ${heroHpPct <= 25 ? 'low' : heroHpPct <= 50 ? 'mid' : ''}`} role="progressbar" aria-label="Hero HP" aria-valuenow={run.hero.hp} aria-valuemax={run.hero.maxHp}>
                  <div className="stat-bar-trail" style={{ width: `${heroHpPct}%` }} aria-hidden="true" />
                  <div className="stat-bar-fill" style={{ width: `${heroHpPct}%` }} aria-hidden="true" />
                  <span className="hp-bar-label">{run.hero.hp}/{run.hero.maxHp}</span>
                </div>
                {run.hero.block > 0 ? <span className="combatant-stat combatant-block">🛡 {run.hero.block}</span> : null}
                <span className="combatant-stat">⚡ {run.hero.energy} EN</span>
                {run.hero.hex > 0 ? <span className="combatant-stat combatant-hex">☣ {run.hero.hex} HEX</span> : null}
                {run.hero.boon > 0 ? <span className="combatant-stat combatant-boon">✦ {run.hero.boon} BOON</span> : null}
              </div>
              <div className="battlefield-divider" aria-hidden="true" />
              <div className={`combatant combatant-enemy ${enemyShake ? 'is-hit' : ''} ${run.phase === 'clash' ? 'is-active' : ''}`}>
                {enemyFx.map((item) => (
                  <span key={item.id} className={`floating-fx floating-fx-${item.kind}`}>{item.text}</span>
                ))}
                <span className="combatant-banner combatant-banner-enemy">
                  <span className="combatant-banner-title">{run.enemy.name} · Stage {run.enemy.stage}</span>
                </span>
                <div className="combatant-portrait" aria-hidden="true">
                  <span className="portrait-glyph">☠</span>
                </div>
                <div className={`stat-bar hp-bar ${enemyHpPct <= 25 ? 'low' : enemyHpPct <= 50 ? 'mid' : ''}`} role="progressbar" aria-label="Enemy HP" aria-valuenow={run.enemy.hp} aria-valuemax={run.enemy.maxHp}>
                  <div className="stat-bar-trail" style={{ width: `${enemyHpPct}%` }} aria-hidden="true" />
                  <div className="stat-bar-fill" style={{ width: `${enemyHpPct}%` }} aria-hidden="true" />
                  <span className="hp-bar-label">{run.enemy.hp}/{run.enemy.maxHp}</span>
                </div>
                {run.enemy.block > 0 ? <span className="combatant-stat combatant-block">🛡 {run.enemy.block}</span> : null}
                {run.enemy.hex > 0 ? <span className="combatant-stat combatant-hex">☣ {run.enemy.hex} HEX</span> : null}
                {intent ? (
                  <div className={`enemy-next-action enemy-next-action-${intent.type}`} data-tutorial="intent-row" aria-label="Enemy's next action">
                    <span className="enemy-next-action-label">Next</span>
                    <span className="enemy-next-action-icon" aria-hidden="true">{INTENT_ICONS[intent.type]}</span>
                    <span className="enemy-next-action-text">{formatIntent(intent)}</span>
                  </div>
                ) : null}
                <div className="arena-pill-row" aria-label="Upcoming intents">
                  {intentPreview.map((item) => (
                    <span
                      key={`${item.offset}-${item.intent.type}-${item.intent.value}`}
                      className={item.offset === 0 ? 'arena-pill active' : 'arena-pill'}
                      title={formatIntent(item.intent)}
                    >
                      <span aria-hidden="true">{INTENT_ICONS[item.intent.type]}</span> {formatIntentValue(item.intent)}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="battlefield-ground" aria-label={`Composed word: ${composedWord || 'empty'}`}>
              {composedCardIds.length === 0 ? null : (
                <div className="builder-slots">
                  {composedCardIds.map((cardId, index) => {
                    const handCard = run.deck.hand.find((item) => item.id === cardId);
                    const letter = cardId === WILD_CARD_ID
                      ? (wildLetter || '?')
                      : cardId === ENEMY_VOWEL_CARD_ID
                        ? (run.enemy.weakVowel ?? '?')
                        : handCard?.letter;
                    if (!letter) {
                      return null;
                    }
                    const handleRemove = () => {
                      if (!canCompose) {
                        return;
                      }
                      if (cardId === WILD_CARD_ID) {
                        toggleWildCard();
                      } else if (cardId === ENEMY_VOWEL_CARD_ID) {
                        toggleEnemyVowelCard();
                      } else {
                        toggleComposedCard(cardId);
                      }
                    };
                    if (handCard) {
                      return (
                        <button
                          key={cardId}
                          type="button"
                          className={`builder-slot builder-slot-card ${resolveIndex === index ? 'is-resolving' : ''}`}
                          style={{ animationDelay: `${index * 40}ms` }}
                          onClick={handleRemove}
                          disabled={!canCompose}
                          title="Remove from word"
                        >
                          {resolveIndex === index ? (
                            <span className="resolve-edge-callout" aria-hidden="true">{formatEdge(handCard, splay)}</span>
                          ) : null}
                          <CardFace card={handCard} splay={splay} compact />
                        </button>
                      );
                    }
                    if (cardId === WILD_CARD_ID) {
                      return (
                        <div key={cardId} className="builder-slot builder-slot-wild" style={{ animationDelay: `${index * 40}ms` }}>
                          <input
                            type="text"
                            className="builder-slot-wild-input"
                            maxLength={1}
                            autoFocus
                            value={wildLetter}
                            disabled={!canCompose}
                            onChange={(event) => setWildLetter(event.target.value)}
                            aria-label="Choose the Wild card's letter"
                            placeholder="?"
                          />
                          <button
                            type="button"
                            className="builder-slot-wild-remove"
                            onClick={handleRemove}
                            disabled={!canCompose}
                            title="Remove Wild card from word"
                            aria-label="Remove Wild card from word"
                          >
                            ✕
                          </button>
                        </div>
                      );
                    }
                    return (
                      <button
                        key={cardId}
                        type="button"
                        className={`builder-slot ${resolveIndex === index ? 'is-resolving' : ''}`}
                        style={{ animationDelay: `${index * 40}ms` }}
                        onClick={handleRemove}
                        disabled={!canCompose}
                        title="Remove from word"
                      >
                        <span className="builder-slot-letter">{letter.toUpperCase()}</span>
                      </button>
                    );
                  })}
                </div>
              )}
              <div className="word-totals" aria-label="Word totals">
                {(resolving ? runningTotal.hits : wordTotals.hits) > 0 ? <span key={`hits-${resolving ? runningTotal.hits : wordTotals.hits}`} className="word-total word-total-hits">⚔ {resolving ? runningTotal.hits : wordTotals.hits}</span> : null}
                {(resolving ? runningTotal.blocks : wordTotals.blocks) > 0 ? <span key={`blocks-${resolving ? runningTotal.blocks : wordTotals.blocks}`} className="word-total word-total-blocks">🛡 {resolving ? runningTotal.blocks : wordTotals.blocks}</span> : null}
                {(resolving ? runningTotal.energy : wordTotals.energy) > 0 ? <span key={`energy-${resolving ? runningTotal.energy : wordTotals.energy}`} className="word-total word-total-energy">⚡ {resolving ? runningTotal.energy : wordTotals.energy}</span> : null}
              </div>
            </div>
          </div>
        </section>

        <section className="hand-tray" data-tutorial="hand-tray" aria-label="Hand tray">
          <div className="hand-header">
            <div className="hand-header-left">
              <h2>Hand</h2>
              <div className="deck-piles" aria-label="Deck status">
                <div className={`pile pile-draw ${run.deck.draw.length === 0 ? 'pile-empty' : ''}`} title={`Draw pile: ${run.deck.draw.length} cards`}>
                  <div className="pile-stack" aria-hidden="true">
                    <span className="pile-card" />
                    <span className="pile-card" />
                    <span className="pile-card" />
                    <span className="pile-count">{run.deck.draw.length}</span>
                  </div>
                  <span className="pile-label">Draw</span>
                </div>
                <div className={`pile pile-discard ${run.deck.discard.length === 0 ? 'pile-empty' : ''}`} title={`Discard pile: ${run.deck.discard.length} cards`}>
                  <div className="pile-stack" aria-hidden="true">
                    <span className="pile-card" />
                    <span className="pile-card" />
                    <span className="pile-card" />
                    <span className="pile-count">{run.deck.discard.length}</span>
                  </div>
                  <span className="pile-label">Discard</span>
                </div>
                <div className={`pile pile-fatigue ${run.deck.fatigue.length === 0 ? 'pile-empty' : ''}`} title={`Fatigue pile: ${run.deck.fatigue.length} cards`}>
                  <div className="pile-stack" aria-hidden="true">
                    <span className="pile-card" />
                    <span className="pile-card" />
                    <span className="pile-card" />
                    <span className="pile-count">{run.deck.fatigue.length}</span>
                  </div>
                  <span className="pile-label">Fatigue</span>
                </div>
              </div>
            </div>
            <div className="splay-toggle" data-tutorial="splay-toggle" role="group" aria-label="Splay direction">
              <button
                type="button"
                className={`ink-button ${splay === 'left' ? 'ink-button-primary' : ''}`}
                disabled={!canCompose}
                aria-pressed={splay === 'left'}
                onClick={() => setSplay('left')}
              >
                Splay Left
              </button>
              <button
                type="button"
                className={`ink-button ${splay === 'right' ? 'ink-button-primary' : ''}`}
                disabled={!canCompose}
                aria-pressed={splay === 'right'}
                onClick={() => setSplay('right')}
              >
                Splay Right
              </button>
            </div>
          </div>
          <div className="hand-cards" role="list">
            <button
              type="button"
              className={`hand-card hand-card-special ${composedCardIds.includes(WILD_CARD_ID) ? 'selected' : ''}`}
              role="listitem"
              data-tutorial="wild-card"
              style={fanStyle(0, totalHandSlots)}
              disabled={!canCompose}
              onClick={toggleWildCard}
              aria-pressed={composedCardIds.includes(WILD_CARD_ID)}
              title="Wild card \u2014 plays as any letter, chosen when you cast"
            >
              <p className="hand-letter">{'★'}</p>
              <p className="hand-value">Wild</p>
            </button>
            {showEnemyVowelSlot ? (
              <button
                type="button"
                className={`hand-card hand-card-special ${composedCardIds.includes(ENEMY_VOWEL_CARD_ID) ? 'selected' : ''}`}
                role="listitem"
                data-tutorial="enemy-vowel"
                style={fanStyle(1, totalHandSlots)}
                disabled={!canCompose}
                onClick={toggleEnemyVowelCard}
                aria-pressed={composedCardIds.includes(ENEMY_VOWEL_CARD_ID)}
                title="Enemy weak-spot vowel"
              >
                <p className="hand-letter">{(run.enemy.weakVowel ?? '?').toUpperCase()}</p>
                <p className="hand-value">Weak Spot</p>
              </button>
            ) : null}
            {run.deck.hand.map((card, cardIndex) => (
              <button
                key={card.id}
                type="button"
                className={`hand-card ${selectedIds.has(card.id) ? 'in-word' : ''}`}
                role="listitem"
                style={fanStyle((showEnemyVowelSlot ? 2 : 1) + cardIndex, totalHandSlots)}
                disabled={!canCompose}
                onClick={() => toggleComposedCard(card.id)}
                aria-pressed={selectedIds.has(card.id)}
                title={`Left edge: ${formatEdge(card, 'left')} \u00b7 Right edge: ${formatEdge(card, 'right')}`}
              >
                <CardFace card={card} splay={splay} />
              </button>
            ))}
          </div>
        </section>

        <section className="combat-controls" aria-label="Combat controls">
          <div className="hero-abilities-panel" data-tutorial="items-row" aria-label="Hero abilities">
            <p className="hero-abilities-label">Hero Abilities</p>
            <div className="items-row">
              {run.items.map((item) => (
                <button
                  key={item.def.id}
                  type="button"
                  className={`item-button ${castingItemId === item.def.id ? 'item-button-cast' : ''}`}
                  disabled={!canCompose || item.spent || item.usedThisTurn || run.hero.energy < item.def.energyCost}
                  title={item.def.description}
                  onClick={() => {
                    setCastingItemId(item.def.id);
                    window.setTimeout(
                      () => setCastingItemId((current) => (current === item.def.id ? null : current)),
                      420
                    );
                    useItem(item.def.id);
                  }}
                >
                  <span className="item-button-name">{item.def.name}</span>
                  <span className="item-button-effect">
                    {formatItemEffect(item.def.effectType, item.def.effectValue)}
                    <span className="item-button-cost">⚡{item.def.energyCost}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
          <div className="combat-controls-secondary">
            <button
              type="button"
              className="ink-button icon-button"
              onClick={undoComposedLetter}
              disabled={!canCompose || composedCardIds.length === 0}
              title="Undo Letter"
              aria-label="Undo Letter"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
                <path
                  d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"
                  fill="currentColor"
                />
              </svg>
            </button>
            <button
              type="button"
              className="ink-button icon-button"
              onClick={clearComposedWord}
              disabled={!canCompose || composedCardIds.length === 0}
              title="Clear Word"
              aria-label="Clear Word"
            >
              ✕
            </button>
            <button
              type="button"
              className="ink-button ink-button-ghost icon-button"
              onClick={handlePassTurn}
              disabled={!canCompose}
              title="Pass Turn"
              aria-label="Pass Turn"
            >
              ⏭
            </button>
          </div>
          <button
            className={`ink-button ink-button-primary cast-word-button ${wordIsValid ? 'is-ready' : ''}`}
            onClick={handleSubmitWord}
            disabled={!canCompose || composedCardIds.length === 0 || needsWildLetter}
            title={needsWildLetter ? 'Choose a letter for the Wild card first' : undefined}
          >
            {resolving ? 'Casting\u2026' : 'Cast Word \u2694'}
          </button>
        </section>

        {lastError ? (
          <section className="panel combat-error" role="alert">
            <p>{lastError}</p>
            <button className="ink-button" onClick={clearError}>Dismiss</button>
          </section>
        ) : null}

        {(isVictory || isDefeat) ? (
          <div className="combat-outcome-overlay" aria-live="polite">
            <section className={`panel combat-outcome-card ${isVictory ? 'is-victory' : 'is-defeat'}`}>
              <span className="combat-outcome-banner">{isVictory ? 'Victory' : 'Defeat'}</span>
              <span className="combat-outcome-glyph" aria-hidden="true">{isVictory ? '\u2694' : '\u2620'}</span>
              <p>
                {isVictory
                  ? 'Enemy defeated. Return to the map to continue your route.'
                  : 'The hero has fallen. Return to the map to choose your next iteration.'}
              </p>
              <button className="ink-button ink-button-primary" onClick={onBackToMap}>
                Back to Map
              </button>
            </section>
          </div>
        ) : null}
      </section>
    </div>
  );
}

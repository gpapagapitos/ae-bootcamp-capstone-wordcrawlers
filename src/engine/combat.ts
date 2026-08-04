import { getEdge } from './cards.js';
import { addPenaltyCardToDeck, MAX_ENERGY } from './state.js';
import type { Card, ClashResult, EnemyIntent, ItemDef, RunState, SplayDirection } from './types.js';

/** Applies a Relic's effect vocabulary (shared with Items, spec 009 R9) with no energy cost. */
function applyRelicEffect(state: RunState, def: ItemDef): void {
  switch (def.effectType) {
    case 'gainHits':
      state.pendingItemHits += def.effectValue;
      break;
    case 'gainBlocks':
      state.hero.block += def.effectValue;
      break;
    case 'gainEnergy':
      state.hero.energy = Math.min(MAX_ENERGY, state.hero.energy + def.effectValue);
      break;
    case 'applyHex':
      state.enemy.hex += def.effectValue;
      break;
  }
  state.actionLog.push({ turn: state.turn, message: `Relic ${def.name} triggers: ${def.description}` });
}

/** True for card kinds whose ability/fatigue passes through to the card beneath them (spec 009 R2). */
function isPassThrough(card: Card): boolean {
  return card.kind === 'wild' || card.kind === 'letterOfChoice' || card.kind === 'penalty';
}

/** Finds the effective top card per splay direction, skipping pass-through cards (spec 009 R1/R2). */
export function resolveTopCard(cards: Card[], splay: SplayDirection): Card | null {
  const ordered = splay === 'right' ? cards : [...cards].reverse();
  for (const card of ordered) {
    if (!isPassThrough(card)) {
      return card;
    }
  }
  return ordered[0] ?? null;
}

function applyStageFlipIfDefeated(state: RunState, overflowDamage: number): boolean {
  if (state.enemy.hp > 0 || state.enemy.stage !== 1 || !state.enemy.stage2) {
    return false;
  }

  const stage2 = state.enemy.stage2;
  state.enemy.stage = 2;
  state.enemy.maxHp = stage2.hp;
  state.enemy.hp = Math.max(0, stage2.hp - overflowDamage);
  state.enemy.intents = stage2.intents;
  state.enemy.intentIndex = 0;
  state.enemy.stunned = true;

  state.actionLog.push({
    turn: state.turn,
    message: `${state.enemy.name} flips to Stage 2 with ${state.enemy.hp} HP and is stunned this turn.`
  });

  addPenaltyCardToDeck(state);

  for (const relic of state.relics) {
    if (relic.def.trigger === 'onStageFlip') {
      applyRelicEffect(state, relic.def);
    }
  }

  return true;
}

function resolveEnemyIntent(state: RunState, intent: EnemyIntent): void {
  if (state.enemy.stunned) {
    state.actionLog.push({
      turn: state.turn,
      message: `${state.enemy.name} is stunned and skips intent.`
    });
    state.enemy.stunned = false;
    return;
  }

  if (intent.type === 'attack') {
    const incoming = intent.value;
    const blocked = Math.min(state.hero.block, incoming);
    const hpLoss = incoming - blocked;

    state.hero.block -= blocked;
    state.hero.hp = Math.max(0, state.hero.hp - hpLoss);

    state.actionLog.push({
      turn: state.turn,
      message: `Enemy attacks for ${incoming}. Blocked ${blocked}, lost ${hpLoss} HP.`
    });
    return;
  }

  if (intent.type === 'block') {
    state.enemy.block += intent.value;
    state.actionLog.push({
      turn: state.turn,
      message: `Enemy gains ${intent.value} block.`
    });
    return;
  }

  if (intent.type === 'hex') {
    state.enemy.hex += intent.value;
    state.actionLog.push({
      turn: state.turn,
      message: `Enemy applies ${intent.value} hex counters.`
    });
    return;
  }

  if (intent.type === 'debuff') {
    state.hero.energy = Math.max(0, state.hero.energy - 1);
    addPenaltyCardToDeck(state);
    state.actionLog.push({
      turn: state.turn,
      message: 'Enemy debuff reduces your energy by 1 and slips a Penalty card into your deck.'
    });
    return;
  }

  state.actionLog.push({
    turn: state.turn,
    message: `Enemy charges ${intent.value} power.`
  });
}

export function resolveClash(state: RunState, splay: SplayDirection): ClashResult {
  const cards = state.pendingWordCards;
  const topCard = resolveTopCard(cards, splay);

  let hits = state.pendingItemHits;
  let blocksGenerated = 0;
  let energyGenerated = 0;
  for (const card of cards) {
    const edge = getEdge(card, splay);
    hits += edge.hits;
    blocksGenerated += edge.blocks;
    energyGenerated += edge.energy;
  }

  if (topCard?.ability) {
    state.actionLog.push({ turn: state.turn, message: `${topCard.letter.toUpperCase()} ability: ${topCard.ability}` });
  }

  if (topCard?.kind === 'enemyVowel') {
    state.enemyVowelAvailable = false;
    state.enemy.intentIndex = (state.enemy.intentIndex + 1) % state.enemy.intents.length;
    state.actionLog.push({
      turn: state.turn,
      message: 'Enemy Vowel advances the enemy to its next intent and fatigues.'
    });
  }

  const usedWild = cards.some((card) => card.kind === 'wild');
  if (!usedWild) {
    energyGenerated += 1;
    for (const relic of state.relics) {
      if (relic.def.trigger === 'onWordWithoutWild') {
        applyRelicEffect(state, relic.def);
      }
    }
  }

  let remainingHits = hits;
  const blocked = Math.min(state.enemy.block, remainingHits);
  state.enemy.block -= blocked;
  remainingHits -= blocked;

  const prevEnemyHp = state.enemy.hp;
  state.enemy.hp = Math.max(0, state.enemy.hp - remainingHits);
  const damageToEnemyHp = prevEnemyHp - state.enemy.hp;
  const overflowDamage = remainingHits - damageToEnemyHp;

  state.hero.block += blocksGenerated;
  state.hero.energy = Math.min(MAX_ENERGY, state.hero.energy + energyGenerated);

  const normalizedWord = state.pendingWord ?? '';
  state.actionLog.push({
    turn: state.turn,
    message: `Word '${normalizedWord}' deals ${hits} hits (${blocked} blocked, ${damageToEnemyHp} HP damage), gains ${blocksGenerated} block and ${energyGenerated} energy.`
  });

  const enemyStageFlipped = applyStageFlipIfDefeated(state, overflowDamage);

  const intent = state.enemy.intents[state.enemy.intentIndex % state.enemy.intents.length];
  resolveEnemyIntent(state, intent);

  return {
    hits,
    blocksGenerated,
    energyGenerated,
    damageToEnemyHp,
    enemyIntentApplied: true,
    topCardId: topCard?.id ?? null,
    enemyStageFlipped
  };
}

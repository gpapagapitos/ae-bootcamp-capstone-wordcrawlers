import { resolveClash, resolveTopCard } from "./combat.js";
import { drawCards, MAX_ENERGY, returnPenaltyCardToPool } from "./state.js";
import type { Card, RunState, SplayDirection, TurnPhase } from "./types.js";
import { validateWordStrict } from "./word-validation.js";

const BASE_HAND_SIZE = 7;
/** Kinds that are virtual: never in hand/deck/discard/fatigue (spec 009 R3/R5). */
const VIRTUAL_KINDS = new Set(["wild", "letterOfChoice", "enemyVowel"]);

function setPhase(state: RunState, expected: TurnPhase, next: TurnPhase): void {
  if (state.phase !== expected) {
    throw new Error(
      `Invalid phase transition. Expected ${expected}, got ${state.phase}.`,
    );
  }
  state.phase = next;
}

function parseWordCards(word: string, hand: Card[]): Card[] {
  const letters = word.split("");
  const tempHand = [...hand];
  const chosen: Card[] = [];

  for (const letter of letters) {
    const index = tempHand.findIndex((c) => c.letter.toLowerCase() === letter);
    if (index === -1) {
      throw new Error(`You do not have the letter '${letter}' in hand.`);
    }

    const [card] = tempHand.splice(index, 1);
    chosen.push(card);
  }

  return chosen;
}

/** Moves the top card of the just-played word (and only that card) from discard to fatigue (spec 009 R2). */
function fatigueTopCard(state: RunState, splay: SplayDirection): void {
  const topCard = resolveTopCard(state.pendingWordCards, splay);
  if (!topCard) {
    state.actionLog.push({
      turn: state.turn,
      message: "No top card to fatigue this turn.",
    });
    return;
  }

  const discardIndex = state.deck.discard.findIndex((c) => c.id === topCard.id);
  if (discardIndex === -1) {
    return;
  }

  const [fatigued] = state.deck.discard.splice(discardIndex, 1);
  state.deck.fatigue.push(fatigued);
  state.actionLog.push({
    turn: state.turn,
    message: `Fatigued top card ${fatigued.letter.toUpperCase()}.`,
  });
}

/** Applies the unplayed-Penalty-card negative effect before it moves to discard (spec 009 R6). */
function applyUnplayedPenaltyEffects(state: RunState): void {
  const unplayedPenalties = state.deck.hand.filter(
    (card) => card.kind === "penalty",
  );
  for (const card of unplayedPenalties) {
    state.hero.hp = Math.max(0, state.hero.hp - 1);
    state.actionLog.push({
      turn: state.turn,
      message: `Unplayed Penalty card ${card.letter.toUpperCase()} costs 1 HP.`,
    });
  }
}

/** skipIntentAdvance: true only on the turn a Stage 2 flip already reset intentIndex to 0 (spec 009 R7 FAQ: the enemy always starts its next turn on its first action after flipping, so cleanup must not advance past that reset). */
function cleanupTurn(state: RunState, skipIntentAdvance = false): void {
  setPhase(state, "cleanup", "ended");

  state.pendingWord = null;
  state.pendingWordCards = [];

  applyUnplayedPenaltyEffects(state);
  state.deck.discard.push(...state.deck.hand);
  state.deck.hand = [];

  state.hero.block = 0;
  state.pendingItemHits = 0;
  for (const item of state.items) {
    item.usedThisTurn = false;
  }

  if (state.enemy.hp > 0 && state.hero.hp > 0) {
    if (!skipIntentAdvance) {
      state.enemy.intentIndex =
        (state.enemy.intentIndex + 1) % state.enemy.intents.length;
    }
    state.turn += 1;
    state.phase = "prep";
    drawCards(state, BASE_HAND_SIZE);
    state.actionLog.push({ turn: state.turn, message: "New turn begins." });
  }
}

export function runPrepPhase(state: RunState): void {
  setPhase(state, "prep", "spell");
  state.actionLog.push({
    turn: state.turn,
    message: "Prep complete. Spell phase started.",
  });
}

/** Activates an item during the Spell (Prep) window, spending energy for its effect (spec 009 R9). */
export function useItem(state: RunState, itemId: string): void {
  if (state.phase !== "spell") {
    throw new Error("Items can only be used while composing your word.");
  }

  const item = state.items.find((i) => i.def.id === itemId);
  if (!item) {
    throw new Error("Unknown item.");
  }
  if (item.spent || item.usedThisTurn) {
    throw new Error("That item is not available this turn.");
  }
  if (state.hero.energy < item.def.energyCost) {
    throw new Error("Not enough energy to use that item.");
  }

  state.hero.energy -= item.def.energyCost;
  item.usedThisTurn = true;
  if (item.def.singleUse) {
    item.spent = true;
  }

  switch (item.def.effectType) {
    case "gainHits":
      state.pendingItemHits += item.def.effectValue;
      break;
    case "gainBlocks":
      state.hero.block += item.def.effectValue;
      break;
    case "gainEnergy":
      state.hero.energy = Math.min(
        MAX_ENERGY,
        state.hero.energy + item.def.effectValue,
      );
      break;
    case "applyHex":
      state.enemy.hex += item.def.effectValue;
      break;
  }

  state.actionLog.push({
    turn: state.turn,
    message: `Used item ${item.def.name}: ${item.def.description}`,
  });
}

/** Uses a Consumable during Prep (spec 011 RC3/RC5): no energy cost, no per-turn lock, removed from inventory immediately. */
export function useConsumable(state: RunState, consumableId: string): void {
  if (state.phase !== "spell") {
    throw new Error("Consumables can only be used while composing your word.");
  }

  const index = state.consumables.findIndex((c) => c.def.id === consumableId);
  if (index === -1) {
    throw new Error("Unknown consumable.");
  }

  const [consumable] = state.consumables.splice(index, 1);

  switch (consumable.def.effectType) {
    case "gainHits":
      state.pendingItemHits += consumable.def.effectValue;
      break;
    case "gainBlocks":
      state.hero.block += consumable.def.effectValue;
      break;
    case "gainEnergy":
      state.hero.energy = Math.min(
        MAX_ENERGY,
        state.hero.energy + consumable.def.effectValue,
      );
      break;
    case "applyHex":
      state.enemy.hex += consumable.def.effectValue;
      break;
  }

  state.actionLog.push({
    turn: state.turn,
    message: `Used consumable ${consumable.def.name}: ${consumable.def.description}`,
  });
}

/** Core word-submission logic shared by hand-typed words and pre-resolved composed cards (e.g. with a Wild card). */
function resolveSubmittedWord(
  state: RunState,
  word: string,
  cards: Card[],
  splay: SplayDirection,
): void {
  state.pendingWord = word;
  state.pendingWordCards = cards;

  const realCards = cards.filter(
    (card) => !VIRTUAL_KINDS.has(card.kind ?? "letter"),
  );
  const realIds = new Set(realCards.map((c) => c.id));
  state.deck.hand = state.deck.hand.filter((c) => !realIds.has(c.id));

  for (const card of realCards) {
    if (card.kind === "penalty") {
      returnPenaltyCardToPool(state, card);
    } else {
      state.deck.discard.push(card);
    }
  }

  const clashResult = resolveClash(state, splay);
  fatigueTopCard(state, splay);

  state.phase = "cleanup";
  cleanupTurn(state, clashResult.enemyStageFlipped);
}

export function submitWord(
  state: RunState,
  word: string,
  splay: SplayDirection = "right",
): void {
  setPhase(state, "spell", "clash");

  const validation = validateWordStrict(word);
  if (!validation.valid) {
    state.phase = "spell";
    throw new Error(validation.reason);
  }

  const chosenCards = parseWordCards(validation.normalized, state.deck.hand);
  resolveSubmittedWord(state, validation.normalized, chosenCards, splay);
}

/** Submits a word built from an explicit ordered card list (supports Wild/Enemy Vowel pseudo-cards). */
export function submitComposedCards(
  state: RunState,
  cards: Card[],
  splay: SplayDirection = "right",
): void {
  setPhase(state, "spell", "clash");

  const word = cards
    .map((card) => card.letter)
    .join("")
    .toLowerCase();
  const validation = validateWordStrict(word);
  if (!validation.valid) {
    state.phase = "spell";
    throw new Error(validation.reason);
  }

  resolveSubmittedWord(state, validation.normalized, cards, splay);
}

export function passTurn(state: RunState): void {
  setPhase(state, "spell", "clash");
  state.pendingWord = "pass";
  state.pendingWordCards = [];
  state.actionLog.push({
    turn: state.turn,
    message: "Player passes without spelling a word.",
  });

  const intent =
    state.enemy.intents[state.enemy.intentIndex % state.enemy.intents.length];
  if (!state.enemy.stunned && intent.type === "attack") {
    const incoming = intent.value;
    const blocked = Math.min(state.hero.block, incoming);
    const hpLoss = incoming - blocked;
    state.hero.block -= blocked;
    state.hero.hp = Math.max(0, state.hero.hp - hpLoss);
    state.actionLog.push({
      turn: state.turn,
      message: `Enemy attacks for ${incoming}. Blocked ${blocked}, lost ${hpLoss} HP.`,
    });
  } else if (state.enemy.stunned) {
    state.enemy.stunned = false;
    state.actionLog.push({
      turn: state.turn,
      message: `${state.enemy.name} is stunned and skips intent.`,
    });
  }

  state.phase = "cleanup";
  cleanupTurn(state);
}

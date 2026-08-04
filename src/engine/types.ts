export type HeroId = "duelist" | "arcanist";

export type TurnPhase = "prep" | "spell" | "clash" | "cleanup" | "ended";

export type EnemyIntentType = "attack" | "block" | "hex" | "debuff" | "charge";

/** Splay direction per spec 009 R1: determines top card and which edge values count. */
export type SplayDirection = "left" | "right";

/** Card kinds that pass ability/fatigue through to the card beneath them (spec 009 R2), plus 'enemyVowel' which has a real ability. */
export type CardKind =
  "letter" | "wild" | "letterOfChoice" | "penalty" | "enemyVowel";

export interface CardEdge {
  hits: number;
  blocks: number;
  energy: number;
}

export interface Card {
  id: string;
  letter: string;
  /** Simplified base value retained for rewards/shop pricing and display. */
  value: number;
  rarity: 1 | 2 | 3;
  tags: string[];
  /** Left/right edge values for splay-based combat resolution (spec 009 R1). Falls back to `value` as hits if omitted. */
  left?: CardEdge;
  right?: CardEdge;
  /** Ability text activated only when this card is the top card of the played word (spec 009 R2). */
  ability?: string;
  /** Defaults to 'letter'. Wild/letterOfChoice/penalty cards have no ability and pass fatigue through. */
  kind?: CardKind;
}

export interface HeroState {
  id: HeroId;
  hp: number;
  maxHp: number;
  block: number;
  energy: number;
  /** Negative counter; resets to 0 at Character Development (spec 009 R8). */
  hex: number;
  /** Positive counter; persists across encounters within a run (spec 009 R4). */
  boon: number;
}

export interface EnemyIntent {
  type: EnemyIntentType;
  value: number;
}

export interface EnemyStageConfig {
  hp: number;
  intents: EnemyIntent[];
}

export interface EnemyState {
  id: string;
  name: string;
  stage: 1 | 2;
  hp: number;
  maxHp: number;
  block: number;
  hex: number;
  boon: number;
  stunned: boolean;
  intentIndex: number;
  intents: EnemyIntent[];
  /** Stage 2 data used when Stage 1 HP reaches 0 (spec 009 R7). Null if the enemy has no second stage. */
  stage2: EnemyStageConfig | null;
  weakVowel?: string;
}

/** An item or relic effect vocabulary kept intentionally small (spec 009 R9). */
export type ItemEffectType =
  "gainHits" | "gainBlocks" | "gainEnergy" | "applyHex";

/** Conditions that auto-fire a Relic's effect (spec 009 R9: relics trigger on stated conditions, no energy cost). */
export type RelicTrigger = "onStageFlip" | "onWordWithoutWild";

export interface ItemDef {
  id: string;
  name: string;
  energyCost: number;
  /** Relics (McGuffin-equivalent) cost no energy and are not manually activated. */
  isRelic: boolean;
  singleUse: boolean;
  effectType: ItemEffectType;
  effectValue: number;
  description: string;
  /** Required and only meaningful when isRelic is true. */
  trigger?: RelicTrigger;
}

export interface ItemInstance {
  def: ItemDef;
  usedThisTurn: boolean;
  /** Single-use items flip face down after use for the rest of the encounter. */
  spent: boolean;
}

export interface DeckZones {
  draw: Card[];
  hand: Card[];
  discard: Card[];
  fatigue: Card[];
}

export interface ActionLogEntry {
  turn: number;
  message: string;
}

export interface RunState {
  seed: number;
  hero: HeroState;
  enemy: EnemyState;
  deck: DeckZones;
  phase: TurnPhase;
  turn: number;
  pendingWord: string | null;
  pendingWordCards: Card[];
  /** Extra hits queued by items this turn; folded into Clash alongside word hits (spec 009 R9). */
  pendingItemHits: number;
  /** Always-available Wild card (spec 009 R3): not in hand/deck/discard/fatigue. */
  wildCard: Card;
  /** Passive Relics (spec 009 R9): auto-trigger via `RelicTrigger`, never manually activated. */
  relics: ItemInstance[];
  /** Shared pool Penalty cards are drawn from and returned to (spec 009 R6). */
  penaltyPool: Card[];
  /** Always-available Enemy Vowel pseudo-card while true (spec 009 R5); fatigues (false) after use. */
  enemyVowelAvailable: boolean;
  items: ItemInstance[];
  actionLog: ActionLogEntry[];
  dictionaryMode: "strict";
}

export interface ClashResult {
  hits: number;
  blocksGenerated: number;
  energyGenerated: number;
  damageToEnemyHp: number;
  enemyIntentApplied: boolean;
  topCardId: string | null;
  enemyStageFlipped: boolean;
}

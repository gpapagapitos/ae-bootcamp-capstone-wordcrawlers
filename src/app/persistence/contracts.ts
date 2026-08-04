import type { ActMap } from "../map/types.js";
import type {
  Card,
  ConsumableDef,
  HeroId,
  ItemDef,
  RunState,
} from "../../engine/types.js";
import type { StandardRelicOption } from "../../engine/cards.js";
import type { EventBuff, EventChoice, EventDef } from "../content/events.js";

export const RUN_SAVE_SCHEMA_VERSION = 1;

export const RUN_SAVE_KEYS = {
  temp: "wordcrawlers.run.temp.v1",
  current: "wordcrawlers.run.current.v1",
  previous: "wordcrawlers.run.previous.v1",
} as const;

export type SaveSlot = "current" | "previous";

export interface EncounterRecord {
  nodeId: string;
  label: string;
}

export interface CombatSnapshot {
  encounterNodeId: string | null;
  run: RunState | null;
  heroId: HeroId;
  composedCardIds: string[];
  lastError: string | null;
}

export type ModalType =
  "reward" | "shop" | "rest" | "event" | "bossReward" | null;

export interface ProgressionSnapshot {
  heroId: HeroId;
  boon: number;
  heroHp: number;
  heroMaxHp: number;
  runDeck: Card[];
  acquiredRelics: ItemDef[];
  consumables: ConsumableDef[];
  bossRelicOptions: ItemDef[];
  standardRelicOptions: StandardRelicOption[];
  activeModal: ModalType;
  rewardOptions: Card[];
  shopOffers: Card[];
  shopConsumableOffer: ConsumableDef | null;
  restCardOptions: Card[];
  eventDef: EventDef | null;
  eventResult: string | null;
  eventResultEffects: EventChoice | null;
  pendingBuff: EventBuff | null;
  initialized: boolean;
}

export interface MapSnapshot {
  map: ActMap;
  currentNodeId: string | null;
  visitedNodeIds: string[];
  encounterHistory: EncounterRecord[];
}

export interface RunSavePayload {
  combat: CombatSnapshot;
  map: MapSnapshot;
  progression: ProgressionSnapshot;
}

export interface RunSaveEnvelope {
  schemaVersion: number;
  savedAt: number;
  checksum: string;
  payload: RunSavePayload;
}

export type SaveErrorReason =
  | "storage-unavailable"
  | "write-failed"
  | "invalid-json"
  | "missing-field"
  | "invalid-checksum"
  | "unsupported-schema"
  | "corrupt-payload"
  | "not-found";

export interface SaveResult {
  ok: boolean;
  reason?: SaveErrorReason;
}

export interface LoadSuccess {
  ok: true;
  payload: RunSavePayload;
  savedAt: number;
  slot: SaveSlot;
}

export interface LoadFailure {
  ok: false;
  reason: SaveErrorReason;
}

export type LoadResult = LoadSuccess | LoadFailure;

export interface LocalStorageLike {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
}

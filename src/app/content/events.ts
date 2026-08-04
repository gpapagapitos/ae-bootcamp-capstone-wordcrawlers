import type { HeroId } from "../../engine/types.js";

export type EventCardEffect =
  "addCard" | "removeCard" | "upgradeCard" | "curseCard";
export type EventBuffType = "heroBonusEnergy" | "heroBonusBlock" | "enemyHex";

export interface EventBuff {
  type: EventBuffType;
  value: number;
}

export interface EventChoice {
  id: string;
  label: string;
  outcomeText: string;
  deltaHp?: number;
  deltaBoon?: number;
  /** Deck-mutating effect resolved by progressionStore.chooseEventOption. */
  cardEffect?: EventCardEffect;
  /** Applied once at the start of the player's next encounter, then consumed. */
  buff?: EventBuff;
  /** Grants a starter-pool Consumable by id if the player doesn't already own one and isn't at cap (spec 011 RC4). */
  grantConsumableId?: string;
  /** Only offered when the current run's hero matches; hidden otherwise. */
  heroOnly?: HeroId;
}

export interface EventDef {
  id: string;
  title: string;
  description: string;
  choices: EventChoice[];
}

/** Narrative event pool (Verdant Vault flavor). Mixes HP/boon trades, deck effects, and pre-fight buffs/curses. */
export const EVENT_POOL: EventDef[] = [
  {
    id: "moss-shrine",
    title: "The Moss Shrine",
    description:
      "A brass idol half-swallowed by moss hums faintly. It seems to want an offering.",
    choices: [
      {
        id: "offer-boon",
        label: "Offer a handful of boons",
        outcomeText: "The idol drinks your offering and mends your wounds.",
        deltaBoon: -4,
        deltaHp: 3,
      },
      {
        id: "offer-blood",
        label: "Offer a drop of your own blood",
        outcomeText:
          "The shrine flares brass-gold, gifting you boons for your pain.",
        deltaHp: -2,
        deltaBoon: 10,
      },
      {
        id: "leave",
        label: "Leave it undisturbed",
        outcomeText:
          "You step back quietly. Nothing is gained, nothing is lost.",
      },
    ],
  },
  {
    id: "sandstone-cache",
    title: "Sandstone Cache",
    description:
      "A crumbling wall hides a sealed cache. Prying it open looks risky.",
    choices: [
      {
        id: "pry-careful",
        label: "Pry it open carefully",
        outcomeText: "A slow, steady pull frees the cache safely.",
        deltaBoon: 6,
      },
      {
        id: "pry-fast",
        label: "Force it open fast",
        outcomeText: "It springs a dusty trap, but the haul is bigger.",
        deltaHp: -2,
        deltaBoon: 14,
      },
      {
        id: "ignore",
        label: "Keep moving",
        outcomeText: "You leave the cache sealed behind you.",
      },
    ],
  },
  {
    id: "dusk-wanderer",
    title: "The Dusk Wanderer",
    description:
      "A cloaked traveler offers to trade stories for rest, or coin for safe passage.",
    choices: [
      {
        id: "trade-stories",
        label: "Trade stories by the fire",
        outcomeText: "Their tale settles your nerves; you rest easy.",
        deltaHp: 4,
      },
      {
        id: "pay-toll",
        label: "Pay their toll",
        outcomeText:
          "They nod and hand back a pouch of boons for your generosity.",
        deltaBoon: -3,
        deltaHp: 2,
      },
      {
        id: "part-ways",
        label: "Part ways quietly",
        outcomeText: "You continue on, unchanged.",
      },
    ],
  },
  {
    id: "stone-well",
    title: "The Stone Well",
    description:
      "A deep well glows faintly with brass-flecked water. It looks safe to drink, mostly.",
    choices: [
      {
        id: "drink",
        label: "Drink from the well",
        outcomeText: "The water is bracing and restorative.",
        deltaHp: 5,
      },
      {
        id: "draw-water",
        label: "Draw water in a flask to sell later",
        outcomeText: "You bottle the shimmer for a tidy sum of boons.",
        deltaBoon: 8,
        deltaHp: -1,
      },
      {
        id: "walk-on",
        label: "Walk on",
        outcomeText: "Best not to tempt fate. You move along.",
      },
    ],
  },
  {
    id: "brass-forge",
    title: "The Brass Forge",
    description:
      "A cracked forge still glows with embered heat, ready to temper a sigil.",
    choices: [
      {
        id: "temper",
        label: "Temper a sigil in the embers",
        outcomeText: "You quench a card in molten brass; it comes out sharper.",
        cardEffect: "upgradeCard",
      },
      {
        id: "feed-forge",
        label: "Feed the forge a sigil",
        outcomeText: "The forge devours the card, spitting boons in return.",
        cardEffect: "removeCard",
        deltaBoon: 8,
      },
      {
        id: "walk-past",
        label: "Walk past",
        outcomeText: "The forge dims behind you as you move on.",
      },
    ],
  },
  {
    id: "wandering-scribe",
    title: "The Wandering Scribe",
    description:
      "A hunched scribe offers to copy a sigil from your deck, for a price.",
    choices: [
      {
        id: "pay-copy",
        label: "Pay for a copy",
        outcomeText:
          "The scribe inks a fresh sigil and presses it into your hand.",
        cardEffect: "addCard",
        deltaBoon: -5,
      },
      {
        id: "trade-story",
        label: "Trade a story instead",
        outcomeText: "The scribe listens well; you leave lighter and rested.",
        deltaHp: 2,
      },
      {
        id: "decline",
        label: "Decline",
        outcomeText: "The scribe shrugs and returns to their ledger.",
      },
    ],
  },
  {
    id: "sunken-altar",
    title: "The Sunken Altar",
    description:
      "A moss-slick altar hums with dormant hex, waiting for a bargain.",
    choices: [
      {
        id: "mark-the-road",
        label: "Lay a curse upon the road ahead",
        outcomeText:
          "You mark the path ahead; whatever waits there will falter first.",
        buff: { type: "enemyHex", value: 3 },
      },
      {
        id: "refuse-altar",
        label: "Refuse the altar's bargain",
        outcomeText:
          "You step back and the hum fades. You feel steadier for it.",
        deltaHp: 2,
      },
    ],
  },
  {
    id: "thornwarden-trial",
    title: "The Thornwarden's Trial",
    description:
      "A thornwarden blocks the path, demanding you prove your kit before passing.",
    choices: [
      {
        id: "answer-steel",
        label: "Answer with steel",
        outcomeText:
          "Your blade-work impresses the thornwarden, who pays the toll in boons.",
        deltaBoon: 10,
        deltaHp: -2,
        heroOnly: "duelist",
      },
      {
        id: "answer-glyph",
        label: "Answer with glyphwork",
        outcomeText:
          "Your hexcraft impresses the thornwarden, who pays the toll in boons.",
        deltaBoon: 10,
        deltaHp: -2,
        heroOnly: "arcanist",
      },
      {
        id: "walk-away",
        label: "Walk away from the trial",
        outcomeText: "The thornwarden lets you pass without a word.",
      },
    ],
  },
  {
    id: "brass-caravan",
    title: "The Brass Caravan",
    description: "A caravan of tinkers offers repairs before the road ahead.",
    choices: [
      {
        id: "quick-patch",
        label: "Take a quick patch",
        outcomeText:
          "They bolt a brass plate to your kit; you'll start your next clash braced.",
        buff: { type: "heroBonusBlock", value: 6 },
      },
      {
        id: "full-tuneup",
        label: "Pay for a full tune-up",
        outcomeText:
          "They work through the night. You leave healed and lighter of purse.",
        deltaBoon: -6,
        deltaHp: 4,
      },
      {
        id: "move-on",
        label: "Move on",
        outcomeText: "You leave the caravan behind.",
      },
    ],
  },
  {
    id: "wild-hollow",
    title: "The Wild Hollow",
    description:
      "A hollow tree drips with wild ichor, the same stuff that powers your Wild card.",
    choices: [
      {
        id: "drink-ichor",
        label: "Drink the ichor",
        outcomeText:
          "Wild energy floods your veins; you'll start your next clash charged.",
        buff: { type: "heroBonusEnergy", value: 2 },
      },
      {
        id: "bottle-ichor",
        label: "Bottle it instead",
        outcomeText:
          "You cork a vial of shimmering ichor and sell it down the road.",
        deltaBoon: 6,
      },
      {
        id: "leave-hollow",
        label: "Leave it be",
        outcomeText: "Some things are better left undisturbed.",
      },
    ],
  },
  {
    id: "penance-stone",
    title: "The Penance Stone",
    description: "A carved stone demands penance before it will yield passage.",
    choices: [
      {
        id: "accept-penance",
        label: "Accept the penance",
        outcomeText:
          "A cursed sigil seeps into your deck, but the stone rewards you well.",
        cardEffect: "curseCard",
        deltaBoon: 12,
      },
      {
        id: "refuse-penance",
        label: "Refuse",
        outcomeText: "The stone falls silent. You pass unburdened.",
      },
    ],
  },
  {
    id: "echoing-well",
    title: "The Echoing Well",
    description: "Voices echo up from a well that has no bottom.",
    choices: [
      {
        id: "answer-voices",
        label: "Answer them",
        outcomeText: "The voices reward your nerve, though the toll is steep.",
        deltaHp: -3,
        deltaBoon: 16,
      },
      {
        id: "ignore-voices",
        label: "Ignore them",
        outcomeText: "You back away as the echoes fade into silence.",
        deltaHp: 1,
      },
    ],
  },
  {
    id: "gilded-vine",
    title: "The Gilded Vine",
    description: "A vine threaded with brass coins climbs the ruin wall.",
    choices: [
      {
        id: "harvest-careful",
        label: "Harvest carefully",
        outcomeText:
          "You strip a handful of coins without disturbing the vine.",
        deltaBoon: 6,
      },
      {
        id: "harvest-greedy",
        label: "Harvest greedily",
        outcomeText: "The vine lashes back, but your pouch is much heavier.",
        deltaBoon: 14,
        deltaHp: -2,
      },
      {
        id: "leave-vine",
        label: "Leave the vine",
        outcomeText: "You leave the gilded vine untouched.",
      },
    ],
  },
  {
    id: "quiet-vigil",
    title: "The Quiet Vigil",
    description:
      "A quiet vigil offers real rest, if you can sit still long enough.",
    choices: [
      {
        id: "sit-vigil",
        label: "Sit and rest",
        outcomeText: "The stillness does you real good.",
        deltaHp: 6,
      },
      {
        id: "keep-moving",
        label: "Keep moving",
        outcomeText: "You press on and pocket a few stray boons along the way.",
        deltaBoon: 3,
      },
    ],
  },
];

function hashSeed(seed: number): number {
  let hash = Math.trunc(seed) >>> 0;
  hash ^= hash << 13;
  hash ^= hash >>> 17;
  hash ^= hash << 5;
  return Math.abs(hash >>> 0);
}

export function pickEvent(seed: number): EventDef {
  const index = hashSeed(seed) % EVENT_POOL.length;
  return EVENT_POOL[index];
}

/** Short label for a queued pre-fight buff/curse, shown on the map until it's consumed. */
export function describeBuff(buff: EventBuff): string {
  switch (buff.type) {
    case "heroBonusEnergy":
      return `Next Fight: +${buff.value} Energy`;
    case "heroBonusBlock":
      return `Next Fight: +${buff.value} Block`;
    case "enemyHex":
      return `Next Foe: +${buff.value} Hex`;
    default:
      return "Next Fight: Blessed";
  }
}

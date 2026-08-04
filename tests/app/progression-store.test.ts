import { beforeEach, describe, expect, it } from 'vitest';
import { EVENT_POOL } from '../../src/app/content/events.js';
import { useProgressionStore } from '../../src/app/store/progressionStore.js';

function getEvent(id: string) {
  const event = EVENT_POOL.find((item) => item.id === id);
  if (!event) {
    throw new Error(`expected event ${id} to exist in EVENT_POOL`);
  }
  return event;
}

function resetProgressionStore(): void {
  useProgressionStore.setState({
    heroId: 'duelist',
    boon: 12,
    heroHp: 50,
    heroMaxHp: 50,
    runDeck: [],
    activeModal: null,
    rewardOptions: [],
    shopOffers: [],
    restCardOptions: [],
    eventDef: null,
    eventResult: null,
    eventResultEffects: null,
    pendingBuff: null,
    initialized: false
  });
}

describe('progression store flows', () => {
  beforeEach(() => {
    resetProgressionStore();
  });

  it('initializes run deck once from hero starter state', () => {
    const store = useProgressionStore.getState();
    store.initializeRunDeck('duelist', 777);

    const state = useProgressionStore.getState();
    expect(state.initialized).toBe(true);
    expect(state.runDeck.length).toBe(10);
  });

  it('opens reward and adds selected card to run deck', () => {
    const store = useProgressionStore.getState();
    store.initializeRunDeck('duelist', 777);
    store.openRewardModal(1000);

    const option = useProgressionStore.getState().rewardOptions[0];
    expect(option).toBeDefined();

    store.pickReward(option.id);

    const state = useProgressionStore.getState();
    expect(state.activeModal).toBeNull();
    expect(state.rewardOptions.length).toBe(0);
    expect(state.runDeck.some((card) => card.id === option.id)).toBe(true);
  });

  it('supports buying (replacing a deck card) and removing cards in shop flow', () => {
    const store = useProgressionStore.getState();
    store.initializeRunDeck('duelist', 777);
    store.openShopModal(1000);

    const offer = useProgressionStore.getState().shopOffers[0];
    const boonBeforeBuy = useProgressionStore.getState().boon;
    const deckBefore = useProgressionStore.getState().runDeck;
    const replaceTarget = deckBefore[0];

    store.buyShopCard(offer.id, replaceTarget.id);

    const afterBuy = useProgressionStore.getState();
    expect(afterBuy.runDeck.some((card) => card.id === offer.id)).toBe(true);
    expect(afterBuy.runDeck.some((card) => card.id === replaceTarget.id)).toBe(false);
    expect(afterBuy.runDeck.length).toBe(deckBefore.length);
    expect(afterBuy.boon).toBeLessThan(boonBeforeBuy);

    const removable = afterBuy.runDeck[1];
    store.removeDeckCard(removable.id);

    const afterRemove = useProgressionStore.getState();
    expect(afterRemove.runDeck.some((card) => card.id === removable.id)).toBe(false);
    expect(afterRemove.boon).toBeLessThan(afterBuy.boon);
  });

  it('resets progression for a fresh run', () => {
    const store = useProgressionStore.getState();
    store.initializeRunDeck('duelist', 777);
    store.openRewardModal(1000);

    const option = useProgressionStore.getState().rewardOptions[0];
    store.pickReward(option.id);

    const beforeReset = useProgressionStore.getState();
    expect(beforeReset.runDeck.length).toBeGreaterThan(10);

    store.resetProgression('duelist', 8899);

    const afterReset = useProgressionStore.getState();
    expect(afterReset.activeModal).toBeNull();
    expect(afterReset.rewardOptions.length).toBe(0);
    expect(afterReset.shopOffers.length).toBe(0);
    expect(afterReset.runDeck.length).toBe(10);
    expect(afterReset.boon).toBe(12);
    expect(afterReset.initialized).toBe(true);
  });

  it('rest node heals hero HP up to max', () => {
    const store = useProgressionStore.getState();
    store.initializeRunDeck('duelist', 777);
    useProgressionStore.setState({ heroHp: 5, heroMaxHp: 50 });
    store.openRestModal(1000);

    expect(useProgressionStore.getState().activeModal).toBe('rest');
    store.chooseRestHeal();

    const state = useProgressionStore.getState();
    expect(state.heroHp).toBeGreaterThan(5);
    expect(state.heroHp).toBeLessThanOrEqual(state.heroMaxHp);
    expect(state.activeModal).toBeNull();
  });

  it('rest node upgrades a chosen deck card', () => {
    const store = useProgressionStore.getState();
    store.initializeRunDeck('duelist', 777);
    store.openRestModal(1000);

    const option = useProgressionStore.getState().restCardOptions[0];
    expect(option).toBeDefined();
    const originalValue = option.value;

    store.chooseRestUpgrade(option.id);

    const state = useProgressionStore.getState();
    const upgraded = state.runDeck.find((card) => card.id === option.id);
    expect(upgraded?.value).toBe(originalValue + 1);
    expect(upgraded?.tags).toContain('upgraded');
    expect(state.activeModal).toBeNull();
  });

  it('event node applies choice effects and can be dismissed', () => {
    const store = useProgressionStore.getState();
    store.initializeRunDeck('duelist', 777);
    store.openEventModal(2);

    const event = useProgressionStore.getState().eventDef;
    expect(event).toBeDefined();
    if (!event) {
      throw new Error('expected event to be defined');
    }

    store.chooseEventOption(event.choices[0].id);

    const afterChoice = useProgressionStore.getState();
    expect(afterChoice.eventResult).toBe(event.choices[0].outcomeText);
    expect(afterChoice.eventResultEffects).toBe(event.choices[0]);
    expect(afterChoice.activeModal).toBe('event');

    store.closeModal();
    expect(useProgressionStore.getState().activeModal).toBeNull();
    expect(useProgressionStore.getState().eventResultEffects).toBeNull();
  });

  it('rest node cleanses a cursed card from the deck', () => {
    const store = useProgressionStore.getState();
    store.initializeRunDeck('duelist', 777);
    useProgressionStore.setState({ eventDef: getEvent('penance-stone'), eventResult: null, activeModal: 'event' });
    store.chooseEventOption('accept-penance');

    const beforeCleanse = useProgressionStore.getState();
    const cursedCount = beforeCleanse.runDeck.filter((card) => card.kind === 'penalty').length;
    expect(cursedCount).toBeGreaterThan(0);

    store.openRestModal(1000);
    store.chooseRestCleanse();

    const afterCleanse = useProgressionStore.getState();
    expect(afterCleanse.runDeck.filter((card) => card.kind === 'penalty').length).toBe(cursedCount - 1);
    expect(afterCleanse.activeModal).toBeNull();
  });

  it('event buff choice is queued and consumed exactly once', () => {
    const store = useProgressionStore.getState();
    store.initializeRunDeck('duelist', 777);
    useProgressionStore.setState({ eventDef: getEvent('sunken-altar'), eventResult: null, activeModal: 'event' });
    store.chooseEventOption('mark-the-road');

    expect(useProgressionStore.getState().pendingBuff).toEqual({ type: 'enemyHex', value: 3 });

    const consumed = store.consumePendingBuff();
    expect(consumed).toEqual({ type: 'enemyHex', value: 3 });
    expect(useProgressionStore.getState().pendingBuff).toBeNull();
    expect(store.consumePendingBuff()).toBeNull();
  });

  it('event card effect adds a card to the run deck', () => {
    const store = useProgressionStore.getState();
    store.initializeRunDeck('duelist', 777);
    const before = useProgressionStore.getState().runDeck.length;

    useProgressionStore.setState({ eventDef: getEvent('wandering-scribe'), eventResult: null, activeModal: 'event' });
    store.chooseEventOption('pay-copy');

    expect(useProgressionStore.getState().runDeck.length).toBe(before + 1);
  });
});

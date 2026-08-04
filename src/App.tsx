import { useEffect, useMemo, useRef, useState } from "react";
import { CombatHud } from "./app/components/CombatHud.js";
import { EventModal } from "./app/components/EventModal.js";
import { HeroSelectScreen } from "./app/components/HeroSelectScreen.js";
import { MapScreen } from "./app/components/MapScreen.js";
import { RestModal } from "./app/components/RestModal.js";
import { RewardModal } from "./app/components/RewardModal.js";
import { ShopModal } from "./app/components/ShopModal.js";
import { TitleScreen } from "./app/components/TitleScreen.js";
import { resolveNodeLabel } from "./app/map/map.js";
import {
  clearRunSnapshot,
  loadRunSnapshot,
  saveRunSnapshot,
} from "./app/persistence/runSave.js";
import type {
  LoadSuccess,
  RunSavePayload,
  SaveErrorReason,
} from "./app/persistence/contracts.js";
import type { HeroId } from "./engine/types.js";
import { useCombatStore } from "./app/store/combatStore.js";
import { useMapStore } from "./app/store/mapStore.js";
import {
  REST_HEAL_AMOUNT,
  useProgressionStore,
} from "./app/store/progressionStore.js";

const COMBAT_NODE_TYPES = new Set(["battle", "elite", "boss"]);
const SAVE_DEBOUNCE_MS = 250;

type SaveBadgeState = "idle" | "saving" | "saved" | "error";

function resolveLoadErrorMessage(reason: SaveErrorReason): string {
  switch (reason) {
    case "unsupported-schema":
      return "Saved run is from an unsupported version and cannot be resumed.";
    case "invalid-checksum":
    case "invalid-json":
    case "missing-field":
    case "corrupt-payload":
      return "Saved run appears corrupted. You can safely abandon it and start fresh.";
    case "storage-unavailable":
      return "Local storage is unavailable. Resume and autosave are disabled.";
    case "write-failed":
      return "Save write failed. Progress may not be persisted until storage is available.";
    case "not-found":
      return "";
    default:
      return "Saved run could not be loaded.";
  }
}

export function App() {
  const { map, currentNodeId, visitedNodeIds, encounterHistory } =
    useMapStore();
  const { encounterNodeId, startEncounter, leaveEncounter } = useCombatStore();
  const {
    heroId,
    activeModal,
    rewardOptions,
    shopOffers,
    restCardOptions,
    eventDef,
    eventResult,
    eventResultEffects,
    runDeck,
    boon,
    heroHp,
    heroMaxHp,
    pendingBuff,
    initializeRunDeck,
    openRewardModal,
    openShopModal,
    openRestModal,
    openEventModal,
    pickReward,
    buyShopCard,
    removeDeckCard,
    chooseRestHeal,
    chooseRestUpgrade,
    chooseRestCleanse,
    chooseEventOption,
    consumePendingBuff,
    closeModal,
    syncDeckFromEncounter,
    initialized,
    resetProgression,
  } = useProgressionStore();
  const handledNodeIds = useRef<Set<string>>(new Set());
  const saveTimeoutRef = useRef<number | null>(null);
  const [saveState, setSaveState] = useState<SaveBadgeState>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [resumeCandidate, setResumeCandidate] = useState<LoadSuccess | null>(
    null,
  );
  const [loadError, setLoadError] = useState<string | null>(null);
  const [runOutcome, setRunOutcome] = useState<"victory" | "defeat" | null>(
    null,
  );
  const [confirmEndRun, setConfirmEndRun] = useState(false);
  const [titleAcknowledged, setTitleAcknowledged] = useState(false);
  const [confirmNewRun, setConfirmNewRun] = useState(false);
  const [actionToast, setActionToast] = useState<{
    text: string;
    tone: "good" | "bad";
  } | null>(null);
  const toastTimeoutRef = useRef<number | null>(null);

  const showActionToast = (text: string, tone: "good" | "bad" = "good") => {
    if (toastTimeoutRef.current !== null) {
      window.clearTimeout(toastTimeoutRef.current);
    }
    setActionToast({ text, tone });
    toastTimeoutRef.current = window.setTimeout(
      () => setActionToast(null),
      1600,
    );
  };

  const handleRestHeal = () => {
    chooseRestHeal();
    showActionToast(`+${REST_HEAL_AMOUNT} HP`, "good");
  };

  const handleRestUpgrade = (cardId: string) => {
    chooseRestUpgrade(cardId);
    showActionToast("Card Upgraded", "good");
  };

  const handleRestCleanse = () => {
    chooseRestCleanse();
    showActionToast("Curse Cleansed", "good");
  };

  const snapshot = useMemo<RunSavePayload>(() => {
    const combat = useCombatStore.getState();
    const mapState = useMapStore.getState();
    const progression = useProgressionStore.getState();

    return {
      combat: {
        encounterNodeId: combat.encounterNodeId,
        run: combat.run,
        heroId: combat.heroId,
        composedCardIds: combat.composedCardIds,
        lastError: combat.lastError,
      },
      map: {
        map: mapState.map,
        currentNodeId: mapState.currentNodeId,
        visitedNodeIds: mapState.visitedNodeIds,
        encounterHistory: mapState.encounterHistory,
      },
      progression: {
        heroId: progression.heroId,
        boon: progression.boon,
        heroHp: progression.heroHp,
        heroMaxHp: progression.heroMaxHp,
        runDeck: progression.runDeck,
        activeModal: progression.activeModal,
        rewardOptions: progression.rewardOptions,
        shopOffers: progression.shopOffers,
        restCardOptions: progression.restCardOptions,
        eventDef: progression.eventDef,
        eventResult: progression.eventResult,
        eventResultEffects: progression.eventResultEffects,
        pendingBuff: progression.pendingBuff,
        initialized: progression.initialized,
      },
    };
  }, [
    encounterNodeId,
    currentNodeId,
    visitedNodeIds,
    encounterHistory,
    heroId,
    activeModal,
    rewardOptions,
    shopOffers,
    restCardOptions,
    eventDef,
    eventResult,
    eventResultEffects,
    runDeck,
    boon,
    heroHp,
    heroMaxHp,
    pendingBuff,
    initialized,
  ]);

  useEffect(() => {
    const loaded = loadRunSnapshot();
    if (loaded.ok) {
      setResumeCandidate(loaded);
      return;
    }

    const message = resolveLoadErrorMessage(loaded.reason);
    if (message) {
      setLoadError(message);
    }
  }, []);

  useEffect(() => {
    if (resumeCandidate || !initialized) {
      return;
    }

    if (saveTimeoutRef.current !== null) {
      window.clearTimeout(saveTimeoutRef.current);
    }

    setSaveState("saving");
    setSaveError(null);

    saveTimeoutRef.current = window.setTimeout(() => {
      const result = saveRunSnapshot(snapshot);
      if (!result.ok) {
        setSaveState("error");
        setSaveError(resolveLoadErrorMessage(result.reason ?? "write-failed"));
        return;
      }

      setSaveState("saved");
      window.setTimeout(() => {
        setSaveState("idle");
      }, 1200);
    }, SAVE_DEBOUNCE_MS);

    return () => {
      if (saveTimeoutRef.current !== null) {
        window.clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [resumeCandidate, initialized, snapshot]);

  const handleSelectHero = (selectedHeroId: HeroId) => {
    useMapStore.getState().resetMap(Date.now());
    handledNodeIds.current = new Set();
    resetProgression(selectedHeroId, Date.now());
  };

  useEffect(() => {
    if (!currentNodeId || handledNodeIds.current.has(currentNodeId)) {
      return;
    }

    const selectedNode = map.nodes.find((node) => node.id === currentNodeId);
    if (!selectedNode) {
      return;
    }

    handledNodeIds.current.add(currentNodeId);

    if (COMBAT_NODE_TYPES.has(selectedNode.type)) {
      const buff = consumePendingBuff();
      startEncounter(
        currentNodeId,
        Date.now(),
        runDeck,
        heroId,
        boon,
        heroHp,
        heroMaxHp,
        buff,
      );
      return;
    }

    if (selectedNode.type === "treasure") {
      openRewardModal(Date.now());
      return;
    }

    if (selectedNode.type === "shop") {
      openShopModal(Date.now());
      return;
    }

    if (selectedNode.type === "rest") {
      openRestModal(Date.now());
      return;
    }

    if (selectedNode.type === "event") {
      openEventModal(Date.now());
    }
  }, [
    currentNodeId,
    heroId,
    map.nodes,
    openRewardModal,
    openShopModal,
    openRestModal,
    openEventModal,
    runDeck,
    startEncounter,
    boon,
    heroHp,
    heroMaxHp,
    consumePendingBuff,
  ]);

  const handleBackToMap = () => {
    const state = useCombatStore.getState();
    const run = state.run;
    const nodeId = state.encounterNodeId;
    const node = nodeId ? map.nodes.find((item) => item.id === nodeId) : null;

    if (run) {
      const won = run.enemy.hp <= 0 && run.hero.hp > 0;
      const lost = run.hero.hp <= 0;

      if (lost) {
        setRunOutcome("defeat");
      }

      if (won) {
        syncDeckFromEncounter(run);
        if (node?.type === "boss") {
          setRunOutcome("victory");
        }
        if (node && node.type !== "boss") {
          openRewardModal(Date.now());
        }
      }
    }

    leaveEncounter();
  };

  const handleResumeRun = () => {
    if (!resumeCandidate) {
      return;
    }

    useCombatStore.setState({ ...resumeCandidate.payload.combat });
    useMapStore.setState({ ...resumeCandidate.payload.map });
    useProgressionStore.setState({ ...resumeCandidate.payload.progression });
    handledNodeIds.current = new Set(
      resumeCandidate.payload.map.visitedNodeIds,
    );
    setResumeCandidate(null);
    setLoadError(null);
    setSaveState("saved");
    setSaveError(null);
  };

  const handleAbandonRun = () => {
    clearRunSnapshot();
    setResumeCandidate(null);
    setLoadError(null);
    setSaveState("idle");
    setSaveError(null);
  };

  const handleStartNewRun = () => {
    useCombatStore.getState().leaveEncounter();
    useMapStore.getState().resetMap(Date.now());
    clearRunSnapshot();
    handledNodeIds.current = new Set();
    setRunOutcome(null);
    setLoadError(null);
    setSaveState("idle");
    setSaveError(null);
    setTitleAcknowledged(false);
    useProgressionStore.setState({ initialized: false });
  };

  const handleRequestNewRunFromTitle = () => {
    if (resumeCandidate) {
      setConfirmNewRun(true);
      return;
    }

    setTitleAcknowledged(true);
  };

  const handleCancelNewRunFromTitle = () => {
    setConfirmNewRun(false);
  };

  const handleConfirmNewRunFromTitle = () => {
    setConfirmNewRun(false);
    handleAbandonRun();
    setTitleAcknowledged(true);
  };

  const handleRerollMap = () => {
    useMapStore.getState().resetMap(Date.now());
    handledNodeIds.current = new Set();
  };

  const handleRequestEndRun = () => {
    setConfirmEndRun(true);
  };

  const handleCancelEndRun = () => {
    setConfirmEndRun(false);
  };

  const handleConfirmEndRun = () => {
    setConfirmEndRun(false);
    handleStartNewRun();
  };

  if (encounterNodeId) {
    const node = map.nodes.find((item) => item.id === encounterNodeId);
    const encounterLabel = node
      ? `${resolveNodeLabel(node.type)} Encounter (${node.id})`
      : `Encounter (${encounterNodeId})`;

    return (
      <CombatHud
        encounterLabel={encounterLabel}
        onBackToMap={handleBackToMap}
      />
    );
  }

  if (!initialized && !titleAcknowledged) {
    return (
      <>
        <TitleScreen
          hasSave={Boolean(resumeCandidate)}
          savedAt={resumeCandidate?.savedAt ?? null}
          loadError={loadError}
          onContinue={handleResumeRun}
          onNewRun={handleRequestNewRunFromTitle}
          onAbandonCorrupted={handleAbandonRun}
        />
        {confirmNewRun ? (
          <div
            className="resume-overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-run-title"
          >
            <div className="resume-card panel">
              <p className="eyebrow">New Run</p>
              <h2 id="new-run-title">Discard Your Saved Run?</h2>
              <p>
                Starting a new run will delete your existing saved progress.
                This cannot be undone.
              </p>
              <div className="resume-actions">
                <button
                  type="button"
                  className="ink-button"
                  onClick={handleConfirmNewRunFromTitle}
                >
                  Discard &amp; Start New Run
                </button>
                <button
                  type="button"
                  className="ink-button"
                  onClick={handleCancelNewRunFromTitle}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </>
    );
  }

  if (!initialized) {
    return <HeroSelectScreen onSelect={handleSelectHero} />;
  }

  return (
    <>
      {loadError ? (
        <div className="save-alert" role="alert">
          <p>{loadError}</p>
          <button
            type="button"
            className="ink-button"
            onClick={handleAbandonRun}
          >
            Abandon Saved Run
          </button>
        </div>
      ) : null}
      {saveState !== "idle" ? (
        <div className="save-badge" aria-live="polite">
          {saveState === "saving" ? "Saving..." : null}
          {saveState === "saved" ? "Saved" : null}
          {saveState === "error" ? "Save Failed" : null}
        </div>
      ) : null}
      {saveState === "error" && saveError ? (
        <div className="save-alert" role="alert">
          <p>{saveError}</p>
        </div>
      ) : null}
      {actionToast ? (
        <div
          className={`action-toast action-toast-${actionToast.tone}`}
          aria-live="polite"
        >
          {actionToast.text}
        </div>
      ) : null}
      <MapScreen onReroll={handleRerollMap} onEndRun={handleRequestEndRun} />
      {activeModal === "reward" ? (
        <RewardModal
          options={rewardOptions}
          onPick={pickReward}
          onClose={closeModal}
        />
      ) : null}
      {activeModal === "shop" ? (
        <ShopModal
          boon={boon}
          offers={shopOffers}
          deck={runDeck}
          onBuy={buyShopCard}
          onRemove={removeDeckCard}
          onClose={closeModal}
        />
      ) : null}
      {activeModal === "rest" ? (
        <RestModal
          heroHp={heroHp}
          heroMaxHp={heroMaxHp}
          healAmount={REST_HEAL_AMOUNT}
          cardOptions={restCardOptions}
          penaltyCardCount={
            runDeck.filter((card) => card.kind === "penalty").length
          }
          onHeal={handleRestHeal}
          onUpgrade={handleRestUpgrade}
          onCleanse={handleRestCleanse}
        />
      ) : null}
      {activeModal === "event" && eventDef ? (
        <EventModal
          event={eventDef}
          heroId={heroId}
          result={eventResult}
          resultEffects={eventResultEffects}
          onChoose={chooseEventOption}
          onContinue={closeModal}
        />
      ) : null}
      {confirmEndRun ? (
        <div
          className="resume-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="end-run-title"
        >
          <div className="resume-card panel">
            <p className="eyebrow">End Run</p>
            <h2 id="end-run-title">Return to Title Screen?</h2>
            <p>
              This will abandon your current run and any saved progress. This
              cannot be undone.
            </p>
            <div className="resume-actions">
              <button
                type="button"
                className="ink-button"
                onClick={handleConfirmEndRun}
              >
                End Run
              </button>
              <button
                type="button"
                className="ink-button"
                onClick={handleCancelEndRun}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {runOutcome ? (
        <div
          className="resume-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="run-outcome-title"
        >
          <div className="resume-card panel">
            <p className="eyebrow">Run Complete</p>
            <h2 id="run-outcome-title">
              {runOutcome === "victory" ? "Victory" : "Defeat"}
            </h2>
            <p>
              {runOutcome === "victory"
                ? "You defeated the Act 1 boss and completed the run."
                : "Your hero fell before finishing the run."}
            </p>
            <p>Start a new run to continue testing builds and routes.</p>
            <div className="resume-actions">
              <button
                type="button"
                className="ink-button"
                onClick={handleStartNewRun}
              >
                Start New Run
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

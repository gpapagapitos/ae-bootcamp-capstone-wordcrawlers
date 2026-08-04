import { getEdge } from "../../engine/cards.js";
import type { StandardRelicOption } from "../../engine/cards.js";
import type { Card, ItemDef } from "../../engine/types.js";
import { getCardDisplayName } from "../store/progressionStore.js";

interface RewardModalProps {
  options: Card[];
  onPick: (cardId: string) => void;
  onClose: () => void;
  /** Standard Relic reward (spec 011 RC2): optional, additive, offered alongside the card reward. */
  relicOptions?: StandardRelicOption[];
  onPickRelicSide?: (baseId: string, side: "a" | "b") => void;
  /** Boss Relic reward (spec 011 RC1): mandatory pick of exactly one, offered on boss victory. */
  bossRelicOptions?: ItemDef[];
  onPickBossRelic?: (relicId: string) => void;
}

/** Stacked hit/block/energy icons shown at the center of the card face (Paperback Adventures card anatomy). */
function EdgeIconStack({ card }: { card: Card }) {
  const edge = getEdge(card, "left");
  const icons: string[] = [
    ...Array(edge.hits).fill("\u2694"),
    ...Array(edge.blocks).fill("\ud83d\udee1"),
    ...Array(edge.energy).fill("\u26a1"),
  ];
  if (icons.length === 0) {
    return null;
  }
  return (
    <div className="shop-card-icons" aria-hidden="true">
      {icons.map((icon, index) => (
        <span key={index}>{icon}</span>
      ))}
    </div>
  );
}

/** Playing-card style corner index, mirrored top-left / bottom-right like a real card. */
function CardCorner({
  card,
  position,
}: {
  card: Card;
  position: "top" | "bottom";
}) {
  return (
    <div className={`shop-card-corner shop-card-corner-${position}`}>
      <span className="shop-card-corner-letter">
        {card.letter.toUpperCase()}
      </span>
      <span className="shop-card-corner-value">{card.value}</span>
    </div>
  );
}

export function RewardModal({
  options,
  onPick,
  onClose,
  relicOptions = [],
  onPickRelicSide,
  bossRelicOptions = [],
  onPickBossRelic,
}: RewardModalProps) {
  const hasBossRelicChoice = bossRelicOptions.length > 0;

  return (
    <div className="modal-overlay" role="presentation">
      <section
        className="panel modal-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Reward selection"
      >
        <header className="modal-header modal-header-banner">
          <h2>Pick a Card</h2>
          <p>Choose 1 of 3 cards to add to your run deck.</p>
        </header>

        <div className="shop-card-grid">
          {options.map((card) => (
            <article
              key={card.id}
              className={`shop-card rarity-${card.rarity}`}
            >
              <CardCorner card={card} position="top" />
              <div className="shop-card-center">
                <p className="shop-card-letter">{card.letter.toUpperCase()}</p>
                <p className="shop-card-name">{getCardDisplayName(card)}</p>
                <EdgeIconStack card={card} />
              </div>
              <CardCorner card={card} position="bottom" />
              <button
                className="ink-button shop-card-buy"
                onClick={() => onPick(card.id)}
              >
                Take Card
              </button>
            </article>
          ))}
        </div>

        {relicOptions.length > 0 ? (
          <div className="reward-relic-section">
            <h3>A Relic glints among the spoils</h3>
            <p>Choose a Relic and permanently pick one of its two sides.</p>
            <div className="reward-relic-grid">
              {relicOptions.map((option) => (
                <article key={option.baseId} className="reward-relic-card">
                  <p className="reward-relic-name">{option.name}</p>
                  <button
                    className="ink-button ink-button-ghost"
                    onClick={() => onPickRelicSide?.(option.baseId, "a")}
                  >
                    {option.sideA.name}: {option.sideA.description}
                  </button>
                  <button
                    className="ink-button ink-button-ghost"
                    onClick={() => onPickRelicSide?.(option.baseId, "b")}
                  >
                    {option.sideB.name}: {option.sideB.description}
                  </button>
                </article>
              ))}
            </div>
          </div>
        ) : null}

        {hasBossRelicChoice ? (
          <div className="reward-relic-section">
            <h3>Character Development: Boss Relic</h3>
            <p>Pick exactly one Boss Relic before you continue.</p>
            <div className="reward-relic-grid">
              {bossRelicOptions.map((relic) => (
                <article key={relic.id} className="reward-relic-card">
                  <p className="reward-relic-name">{relic.name}</p>
                  <p>{relic.description}</p>
                  <button
                    className="ink-button shop-card-buy"
                    onClick={() => onPickBossRelic?.(relic.id)}
                  >
                    Take Relic
                  </button>
                </article>
              ))}
            </div>
          </div>
        ) : null}

        {!hasBossRelicChoice ? (
          <footer className="modal-footer">
            <button className="ink-button ink-button-ghost" onClick={onClose}>
              Skip
            </button>
          </footer>
        ) : null}
      </section>
    </div>
  );
}

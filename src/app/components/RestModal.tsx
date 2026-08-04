import type { Card } from "../../engine/types.js";
import { getCardDisplayName } from "../store/progressionStore.js";

interface RestModalProps {
  heroHp: number;
  heroMaxHp: number;
  healAmount: number;
  cardOptions: Card[];
  penaltyCardCount: number;
  onHeal: () => void;
  onUpgrade: (cardId: string) => void;
  onCleanse: () => void;
}

export function RestModal({
  heroHp,
  heroMaxHp,
  healAmount,
  cardOptions,
  penaltyCardCount,
  onHeal,
  onUpgrade,
  onCleanse,
}: RestModalProps) {
  const atFullHp = heroHp >= heroMaxHp;
  const hasPenaltyCard = penaltyCardCount > 0;

  return (
    <div className="modal-overlay" role="presentation">
      <section
        className="panel modal-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Rest site"
      >
        <header className="modal-header">
          <h2>Mossbound Respite</h2>
          <p>
            Rest to recover, train to upgrade a card, or cleanse a curse. Choose
            one.
          </p>
          <p className="shop-gold">
            HP: {heroHp} / {heroMaxHp}
          </p>
        </header>

        <div className="shop-layout rest-layout">
          <div>
            <h3>Rest</h3>
            <p>Recover {healAmount} HP.</p>
            <button className="ink-button" onClick={onHeal} disabled={atFullHp}>
              {atFullHp ? "Already at full HP" : `Rest (+${healAmount} HP)`}
            </button>
          </div>

          <div>
            <h3>Character Development</h3>
            <p>Upgrade one card in your deck (+1 value).</p>
            <ul className="deck-list">
              {cardOptions.map((card) => (
                <li key={card.id}>
                  <span>
                    {getCardDisplayName(card)} · Value {card.value}
                  </span>
                  <button
                    className="ink-button"
                    onClick={() => onUpgrade(card.id)}
                  >
                    Upgrade
                  </button>
                </li>
              ))}
              {cardOptions.length === 0 ? (
                <li>
                  <span>No eligible cards to upgrade.</span>
                </li>
              ) : null}
            </ul>
          </div>

          <div>
            <h3>Cleanse</h3>
            <p>Remove one cursed sigil from your deck.</p>
            <button
              className="ink-button"
              onClick={onCleanse}
              disabled={!hasPenaltyCard}
            >
              {hasPenaltyCard
                ? `Cleanse a Curse (${penaltyCardCount})`
                : "No curses to cleanse"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

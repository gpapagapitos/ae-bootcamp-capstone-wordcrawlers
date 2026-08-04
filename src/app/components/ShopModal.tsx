import { useState } from "react";
import { getEdge } from "../../engine/cards.js";
import type { Card } from "../../engine/types.js";
import { getCardDisplayName, getCardPrice } from "../store/progressionStore.js";

interface ShopModalProps {
  boon: number;
  offers: Card[];
  deck: Card[];
  onBuy: (cardId: string, replaceCardId: string) => void;
  onRemove: (cardId: string) => void;
  onClose: () => void;
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

export function ShopModal({
  boon,
  offers,
  deck,
  onBuy,
  onRemove,
  onClose,
}: ShopModalProps) {
  const [replaceTargetId, setReplaceTargetId] = useState<string | null>(null);
  const replaceableDeck = deck.filter((card) => card.kind !== "penalty");

  return (
    <div className="modal-overlay" role="presentation">
      <section
        className="panel modal-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Shop"
      >
        <header className="modal-header modal-header-banner">
          <h2>Ink Merchant</h2>
          <p>
            Spend boons to replace a deck card with a new one, or remove one
            from your deck.
          </p>
          <p className="shop-gold">Boons: {boon}</p>
        </header>

        <div className="shop-layout">
          <div>
            <h3>Buy Cards (replaces a selected deck card)</h3>
            <p className="shop-hint">
              {replaceTargetId
                ? "Card selected below. Choose a new card to buy in its place."
                : "Select a card to replace from the list on the right first."}
            </p>
            <div className="shop-card-grid">
              {offers.map((card) => {
                const price = getCardPrice(card);
                return (
                  <article
                    key={card.id}
                    className={`shop-card rarity-${card.rarity}`}
                  >
                    <CardCorner card={card} position="top" />
                    <div className="shop-card-center">
                      <p className="shop-card-letter">
                        {card.letter.toUpperCase()}
                      </p>
                      <p className="shop-card-name">
                        {getCardDisplayName(card)}
                      </p>
                      <EdgeIconStack card={card} />
                    </div>
                    <CardCorner card={card} position="bottom" />
                    <button
                      className="ink-button shop-card-buy"
                      onClick={() => {
                        if (!replaceTargetId) {
                          return;
                        }
                        onBuy(card.id, replaceTargetId);
                        setReplaceTargetId(null);
                      }}
                      disabled={boon < price || !replaceTargetId}
                    >
                      Buy ({price})
                    </button>
                  </article>
                );
              })}
            </div>
          </div>

          <div>
            <h3>Your Deck</h3>
            <p className="shop-hint">
              Select a card to replace, or spend 5 boons to remove one outright.
            </p>
            <ul className="deck-list">
              {replaceableDeck.slice(0, 12).map((card) => (
                <li
                  key={card.id}
                  className={`deck-list-item${replaceTargetId === card.id ? " deck-list-item-selected" : ""}`}
                >
                  <button
                    type="button"
                    className="deck-list-select"
                    onClick={() =>
                      setReplaceTargetId(
                        replaceTargetId === card.id ? null : card.id,
                      )
                    }
                    aria-pressed={replaceTargetId === card.id}
                  >
                    <span className="deck-list-letter">
                      {card.letter.toUpperCase()}
                    </span>
                    <span className="deck-list-info">
                      <strong>{getCardDisplayName(card)}</strong>
                      <span className="deck-list-value">
                        Value {card.value}
                      </span>
                    </span>
                  </button>
                  <button
                    className="ink-button ink-button-ghost deck-list-remove"
                    onClick={() => onRemove(card.id)}
                    disabled={boon < 5 || deck.length <= 5}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <footer className="modal-footer">
          <button className="ink-button" onClick={onClose}>
            Leave Shop
          </button>
        </footer>
      </section>
    </div>
  );
}

import { getEdge } from '../../engine/cards.js';
import type { Card } from '../../engine/types.js';
import { getCardDisplayName } from '../store/progressionStore.js';

interface RewardModalProps {
  options: Card[];
  onPick: (cardId: string) => void;
  onClose: () => void;
}

/** Stacked hit/block/energy icons shown at the center of the card face (Paperback Adventures card anatomy). */
function EdgeIconStack({ card }: { card: Card; }) {
  const edge = getEdge(card, 'left');
  const icons: string[] = [
    ...Array(edge.hits).fill('\u2694'),
    ...Array(edge.blocks).fill('\ud83d\udee1'),
    ...Array(edge.energy).fill('\u26a1')
  ];
  if (icons.length === 0) {
    return null;
  }
  return (
    <div className="shop-card-icons" aria-hidden="true">
      {icons.map((icon, index) => <span key={index}>{icon}</span>)}
    </div>
  );
}

/** Playing-card style corner index, mirrored top-left / bottom-right like a real card. */
function CardCorner({ card, position }: { card: Card; position: 'top' | 'bottom'; }) {
  return (
    <div className={`shop-card-corner shop-card-corner-${position}`}>
      <span className="shop-card-corner-letter">{card.letter.toUpperCase()}</span>
      <span className="shop-card-corner-value">{card.value}</span>
    </div>
  );
}

export function RewardModal({ options, onPick, onClose }: RewardModalProps) {
  return (
    <div className="modal-overlay" role="presentation">
      <section className="panel modal-panel" role="dialog" aria-modal="true" aria-label="Reward selection">
        <header className="modal-header modal-header-banner">
          <h2>Pick a Card</h2>
          <p>Choose 1 of 3 cards to add to your run deck.</p>
        </header>

        <div className="shop-card-grid">
          {options.map((card) => (
            <article key={card.id} className={`shop-card rarity-${card.rarity}`}>
              <CardCorner card={card} position="top" />
              <div className="shop-card-center">
                <p className="shop-card-letter">{card.letter.toUpperCase()}</p>
                <p className="shop-card-name">{getCardDisplayName(card)}</p>
                <EdgeIconStack card={card} />
              </div>
              <CardCorner card={card} position="bottom" />
              <button className="ink-button shop-card-buy" onClick={() => onPick(card.id)}>
                Take Card
              </button>
            </article>
          ))}
        </div>

        <footer className="modal-footer">
          <button className="ink-button ink-button-ghost" onClick={onClose}>Skip</button>
        </footer>
      </section>
    </div>
  );
}

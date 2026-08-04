interface AbilityLine {
  timing: 'submit' | 'clash' | 'cleanup';
  label: string;
  text: string;
}

interface PreviewCard {
  id: string;
  letter: string;
  title: string;
  cost: number;
  rarity: 'common' | 'uncommon' | 'rare';
  role: 'attack' | 'control' | 'utility';
  ability: AbilityLine;
  reminder?: string;
}

interface RarityToken {
  sigil: string;
  shape: 'circle' | 'diamond' | 'triangle';
  label: string;
}

const PREVIEW_CARDS: PreviewCard[] = [
  {
    id: 'c-arc-blade',
    letter: 'A',
    title: 'Arc Blade',
    cost: 1,
    rarity: 'common',
    role: 'attack',
    ability: {
      timing: 'submit',
      label: 'On Submit',
      text: 'If this card is in your word, gain +2 attack.'
    },
    reminder: 'Stacks with other attack boosts.'
  },
  {
    id: 'c-ink-hex',
    letter: 'H',
    title: 'Ink Hex',
    cost: 2,
    rarity: 'uncommon',
    role: 'control',
    ability: {
      timing: 'clash',
      label: 'On Clash',
      text: 'Give 2 Hex to the enemy. If enemy has 4+ Hex, stun it.'
    },
    reminder: 'Hex is stored on enemy and spent by effects.'
  },
  {
    id: 'c-rune-spark',
    letter: 'R',
    title: 'Rune Spark',
    cost: 1,
    rarity: 'rare',
    role: 'utility',
    ability: {
      timing: 'cleanup',
      label: 'On Cleanup',
      text: 'Draw 1 card next turn.'
    }
  }
];

function rarityClass(rarity: PreviewCard['rarity']): string {
  switch (rarity) {
    case 'common':
      return 'rarity-common';
    case 'uncommon':
      return 'rarity-uncommon';
    case 'rare':
      return 'rarity-rare';
    default:
      return 'rarity-common';
  }
}

function rarityToken(rarity: PreviewCard['rarity']): RarityToken {
  switch (rarity) {
    case 'common':
      return { sigil: 'I', shape: 'circle', label: 'common rarity token' };
    case 'uncommon':
      return { sigil: 'II', shape: 'diamond', label: 'uncommon rarity token' };
    case 'rare':
      return { sigil: 'III', shape: 'triangle', label: 'rare rarity token' };
    default:
      return { sigil: 'I', shape: 'circle', label: 'common rarity token' };
  }
}

export function CardPreview() {
  return (
    <section className="panel card-preview-panel">
      <div className="card-preview-header">
        <h2>Card Readability Prototype</h2>
        <p>
          Big letter anchor, short effect sentence, and consistent timing labels so players parse meaning
          in one glance.
        </p>
      </div>
      <div className="card-grid">
        {PREVIEW_CARDS.map((card) => {
          const token = rarityToken(card.rarity);

          return (
            <article key={card.id} className={`wc-card ${rarityClass(card.rarity)}`}>
              <div className="wc-card-token" aria-label={token.label} role="img">
                <span className="token-sigil" aria-hidden="true">{token.sigil}</span>
                <span
                  className={`token-shape token-shape-${token.shape}`}
                  aria-hidden="true"
                />
              </div>
              <header className="wc-card-top">
                <span className="wc-card-letter">{card.letter}</span>
                <div className="wc-card-meta">
                  <h3>{card.title}</h3>
                  <p>
                    {card.role} · cost {card.cost}
                  </p>
                </div>
              </header>

              <div className="wc-card-body">
                <p className="ability-label">
                  <span
                    className={`timing-icon timing-icon-${card.ability.timing}`}
                    aria-hidden="true"
                  />
                  <span>{card.ability.label}</span>
                </p>
                <p className="ability-text">{card.ability.text}</p>
                {card.reminder ? <p className="reminder-text">{card.reminder}</p> : null}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

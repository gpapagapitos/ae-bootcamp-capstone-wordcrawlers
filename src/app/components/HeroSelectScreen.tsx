import { useState } from "react";
import type { HeroId, ItemDef } from "../../engine/types.js";
import { createCoreItems } from "../../engine/cards.js";

interface HeroOption {
  id: HeroId;
  name: string;
  monogram: string;
  playstyle: string;
  hp: number;
  energy: number;
  starterLetters: string[];
}

const HERO_OPTIONS: HeroOption[] = [
  {
    id: "duelist",
    name: "Duelist",
    monogram: "D",
    playstyle:
      "Every Signature Card is a straight trade: energy in, block or hits out. No setup, no gimmicks — just consistent damage and defense.",
    hp: 20,
    energy: 3,
    starterLetters: ["S", "W", "O", "R", "D", "A", "R", "C", "I", "N"],
  },
  {
    id: "arcanist",
    name: "Arcanist",
    monogram: "A",
    playstyle:
      "Splits energy between defense and piling Hex onto the enemy. Hex doesn't do anything by itself yet — it's a resource future relics and upgrades can spend, so this hero rewards planning ahead.",
    hp: 20,
    energy: 3,
    starterLetters: ["H", "E", "X", "G", "L", "Y", "P", "H", "I", "N"],
  },
];

/** Icons paired with the emoji variation selector so they render as full-color glyphs, not thin text glyphs. */
function iconForEffect(effectType: ItemDef["effectType"]): string {
  switch (effectType) {
    case "gainHits":
      return "\u2694\uFE0F";
    case "gainBlocks":
      return "\ud83d\udee1\uFE0F";
    case "gainEnergy":
      return "\u26a1";
    case "applyHex":
      return "\u2623\uFE0F";
    default:
      return "\u2726";
  }
}

interface HeroSelectScreenProps {
  onSelect: (heroId: HeroId) => void;
}

export function HeroSelectScreen({ onSelect }: HeroSelectScreenProps) {
  const [index, setIndex] = useState(0);
  const hero = HERO_OPTIONS[index];
  const coreItems = createCoreItems(hero.id);

  const showPrev = () =>
    setIndex(
      (current) => (current - 1 + HERO_OPTIONS.length) % HERO_OPTIONS.length,
    );
  const showNext = () =>
    setIndex((current) => (current + 1) % HERO_OPTIONS.length);

  return (
    <div className="hero-select-layout">
      <header className="header hero-select-header">
        <div>
          <p className="eyebrow">Wordcrawlers</p>
          <h1>Choose Your Hero</h1>
        </div>
      </header>

      <section className="hero-showcase">
        <button
          type="button"
          className="hero-nav-arrow hero-nav-prev"
          onClick={showPrev}
          aria-label="Previous hero"
        >
          &#8249;
        </button>

        <div className="hero-showcase-portrait" aria-hidden="true">
          <span className="hero-showcase-monogram">{hero.monogram}</span>
          <span className="hero-showcase-portrait-name">{hero.name}</span>
        </div>

        <div className="hero-showcase-info">
          <h2>{hero.name}</h2>

          <div className="hero-showcase-stats">
            <span className="hero-stat">
              &#10084;&#65039; HP {hero.hp}/{hero.hp}
            </span>
            <span className="hero-stat">&#9889; Energy {hero.energy}</span>
            <span className="hero-stat">
              &#128292; {hero.starterLetters.length} Starter Letters
            </span>
          </div>

          <div className="hero-card-letters">
            {hero.starterLetters.map((letter, letterIndex) => (
              <span
                key={`${hero.id}-${letterIndex}-${letter}`}
                className="hero-card-letter"
              >
                {letter}
              </span>
            ))}
          </div>

          <p className="hero-showcase-playstyle">{hero.playstyle}</p>

          <div className="hero-showcase-abilities">
            <p className="hero-showcase-abilities-label">Signature Cards</p>
            {coreItems.map((item) => (
              <div key={item.id} className="hero-ability-slot">
                <span className="hero-ability-icon" aria-hidden="true">
                  {iconForEffect(item.effectType)}
                </span>
                <div className="hero-ability-body">
                  <div className="hero-ability-name-row">
                    <p className="hero-ability-name">{item.name}</p>
                    <span className="hero-ability-cost">
                      &#9889; {item.energyCost}
                    </span>
                  </div>
                  <p className="hero-ability-desc">{item.description}</p>
                </div>
              </div>
            ))}
          </div>

          <button
            className="ink-button ink-button-primary hero-embark"
            onClick={() => onSelect(hero.id)}
          >
            Begin Journey
          </button>
        </div>

        <button
          type="button"
          className="hero-nav-arrow hero-nav-next"
          onClick={showNext}
          aria-label="Next hero"
        >
          &#8250;
        </button>
      </section>

      <div className="hero-select-dots">
        {HERO_OPTIONS.map((option, optionIndex) => (
          <button
            key={option.id}
            type="button"
            className={`hero-select-dot${optionIndex === index ? " hero-select-dot-active" : ""}`}
            onClick={() => setIndex(optionIndex)}
            aria-label={`Show ${option.name}`}
          />
        ))}
      </div>
    </div>
  );
}

import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import {
  advanceTutorialStep,
  createTutorialState,
  currentTutorialStep,
  isLastTutorialStep,
  type TutorialControllerState,
} from "./tutorialController.js";
import type { TutorialContext } from "./tutorialSteps.js";

interface TutorialOverlayProps {
  context: TutorialContext;
  onComplete: () => void;
}

const HIGHLIGHT_CLASS = "tutorial-highlight";
const CARD_MARGIN = 16;

const DEFAULT_CARD_STYLE: CSSProperties = {
  left: "50%",
  bottom: CARD_MARGIN,
  transform: "translateX(-50%)",
};

export function TutorialOverlay({ context, onComplete }: TutorialOverlayProps) {
  const [state, setState] = useState<TutorialControllerState>(() =>
    createTutorialState(context),
  );
  const step = currentTutorialStep(state);
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardStyle, setCardStyle] = useState<CSSProperties>(DEFAULT_CARD_STYLE);

  useLayoutEffect(() => {
    if (!step) {
      return;
    }
    const target = document.querySelector(step.highlightSelector);
    target?.classList.add(HIGHLIGHT_CLASS);

    const card = cardRef.current;
    const reposition = () => {
      if (!target || !card) {
        setCardStyle(DEFAULT_CARD_STYLE);
        return;
      }
      const targetRect = target.getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();
      const viewportW = window.innerWidth;
      const viewportH = window.innerHeight;

      let top = targetRect.bottom + CARD_MARGIN;
      if (top + cardRect.height > viewportH - CARD_MARGIN) {
        top = targetRect.top - cardRect.height - CARD_MARGIN;
      }
      top = Math.max(
        CARD_MARGIN,
        Math.min(top, viewportH - cardRect.height - CARD_MARGIN),
      );

      let left = targetRect.left + targetRect.width / 2 - cardRect.width / 2;
      left = Math.max(
        CARD_MARGIN,
        Math.min(left, viewportW - cardRect.width - CARD_MARGIN),
      );

      setCardStyle({ top, left, bottom: "auto", transform: "none" });
    };

    reposition();
    window.addEventListener("resize", reposition);
    window.addEventListener("scroll", reposition, true);
    return () => {
      target?.classList.remove(HIGHLIGHT_CLASS);
      window.removeEventListener("resize", reposition);
      window.removeEventListener("scroll", reposition, true);
    };
  }, [step]);

  if (!step) {
    return null;
  }

  const handleNext = () => {
    const next = advanceTutorialStep(state);
    if (!next) {
      onComplete();
      return;
    }
    setState(next);
  };

  return (
    <div
      className="tutorial-overlay"
      role="dialog"
      aria-labelledby="tutorial-title"
      aria-live="polite"
    >
      <div className="tutorial-card panel" ref={cardRef} style={cardStyle}>
        <p className="eyebrow">
          Tutorial &middot; Step {state.stepIndex + 1} of {state.steps.length}
        </p>
        <h2 id="tutorial-title">{step.title}</h2>
        <p>{step.body}</p>
        <div className="tutorial-actions">
          <button type="button" className="ink-button" onClick={onComplete}>
            Skip Tutorial
          </button>
          <button
            type="button"
            className="ink-button ink-button-primary"
            onClick={handleNext}
            autoFocus
          >
            {isLastTutorialStep(state) ? "Done" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}

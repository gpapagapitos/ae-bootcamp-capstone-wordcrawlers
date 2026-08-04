interface TitleScreenProps {
  hasSave: boolean;
  savedAt: number | null;
  loadError: string | null;
  onContinue: () => void;
  onNewRun: () => void;
  onAbandonCorrupted: () => void;
}

export function TitleScreen({
  hasSave,
  savedAt,
  loadError,
  onContinue,
  onNewRun,
  onAbandonCorrupted,
}: TitleScreenProps) {
  return (
    <div className="title-screen">
      <div className="title-screen-content">
        <h1 className="title-screen-logo">Wordcrawlers</h1>

        {loadError ? (
          <div className="save-alert" role="alert">
            <p>{loadError}</p>
            <button
              type="button"
              className="ink-button"
              onClick={onAbandonCorrupted}
            >
              Abandon Saved Run
            </button>
          </div>
        ) : null}

        <div className="title-screen-actions">
          {hasSave ? (
            <button
              type="button"
              className="ink-button ink-button-primary title-screen-button"
              onClick={onContinue}
            >
              <span>Continue</span>
              {savedAt ? (
                <span className="title-screen-savedat">
                  {new Date(savedAt).toLocaleString()}
                </span>
              ) : null}
            </button>
          ) : null}
          <button
            type="button"
            className={`ink-button title-screen-button${hasSave ? "" : " ink-button-primary"}`}
            onClick={onNewRun}
          >
            New Run
          </button>
        </div>
      </div>
    </div>
  );
}

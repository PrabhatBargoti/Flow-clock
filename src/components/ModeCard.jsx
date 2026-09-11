import { MAX_FREE_MODES } from "../data/defaults";
import { useFlow } from "../hooks/useFlow";

export function ModeCard() {
  const { defaultModeIds, deleteMode, flow, selectedMode, selectMode } =
    useFlow();
  return (
    <section className="mode-card">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Focus mode</p>
          <h2>Choose your lane</h2>
        </div>
        <span>
          {flow.modes.length}
          {flow.premium.enabled ? "" : ` / ${MAX_FREE_MODES}`}
        </span>
      </div>
      <div className="mode-list">
        {flow.modes.map((mode) => (
          <div
            key={mode.id}
            className={`mode ${mode.id === selectedMode.id ? "selected" : ""}`}
          >
            <button className="mode-select" onClick={() => selectMode(mode.id)}>
              <span style={{ background: mode.accent }}>{mode.icon}</span>
              {mode.name}
            </button>
            {!defaultModeIds.has(mode.id) && (
              <button
                className="mode-delete"
                aria-label={`Remove ${mode.name} mode`}
                onClick={() => deleteMode(mode.id)}
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}


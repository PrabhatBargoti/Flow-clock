import { useRef, useState } from "react";
import {
  MAX_FREE_MODES,
  MAX_THEME_IMAGE_BYTES,
  themes,
} from "../data/defaults";
import { useFlow } from "../hooks/useFlow";

function ThemeSettings() {
  const { flow, updatePreferences } = useFlow();
  const [uploadError, setUploadError] = useState("");
  const fileInput = useRef(null);
  function handleThemeFile(event) {
    const file = event.target.files?.[0];
    setUploadError("");
    if (!file) return;
    if (!flow.premium.enabled)
      return setUploadError(
        "Custom backgrounds are available in premium preview mode.",
      );
    if (!file.type.startsWith("image/"))
      return setUploadError("Choose an image file (PNG, JPEG, WebP, or GIF).");
    if (file.size > MAX_THEME_IMAGE_BYTES)
      return setUploadError("Choose an image smaller than 1.5 MB.");
    const reader = new FileReader();
    reader.onerror = () =>
      setUploadError("The image could not be read. Please try another file.");
    reader.onload = () =>
      updatePreferences({
        themeId: "custom",
        customTheme: { name: file.name, image: reader.result },
      });
    reader.readAsDataURL(file);
  }
  return (
    <section className="settings-section">
      <h2>Theme</h2>
      <div className="theme-options">
        {themes.map((theme) => {
          const unlocked = flow.rewards.unlockedThemes.includes(theme.id);
          return (
            <button
              key={theme.id}
              disabled={!unlocked}
              title={
                unlocked
                  ? theme.name
                  : `Unlock with a ${theme.id === "light" ? "7" : "30"}-day streak`
              }
              onClick={() => updatePreferences({ themeId: theme.id })}
              className={
                flow.preferences.themeId === theme.id ? "selected" : ""
              }
            >
              <i style={{ background: theme.swatch }} />
              {theme.name}
              {!unlocked && " 🔒"}
            </button>
          );
        })}
        <button
          onClick={() => fileInput.current?.click()}
          className={flow.preferences.themeId === "custom" ? "selected" : ""}
        >
          <i className="custom-swatch" />
          Custom
        </button>
      </div>
      <input
        ref={fileInput}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        onChange={handleThemeFile}
        hidden
      />
      {flow.preferences.customTheme && (
        <p className="hint">Using {flow.preferences.customTheme.name}</p>
      )}
      <p className="hint">
        Unlock Light at a 7-day streak and Minimal at a 30-day streak.
      </p>
      {uploadError && (
        <p className="field-error" role="alert">
          {uploadError}
        </p>
      )}
    </section>
  );
}

function ModeSettings() {
  const { addMode, flow } = useFlow();
  const [modeName, setModeName] = useState("");
  const hasReachedFreeLimit =
    !flow.premium.enabled && flow.modes.length >= MAX_FREE_MODES;
  function handleSubmit(event) {
    event.preventDefault();
    if (addMode(modeName)) setModeName("");
  }
  return (
    <section className="settings-section">
      <h2>Add a focus mode</h2>
      <form className="mode-form" onSubmit={handleSubmit}>
        <input
          value={modeName}
          onChange={(event) => setModeName(event.target.value)}
          maxLength="32"
          placeholder="e.g. Language practice"
          aria-label="New mode name"
        />
        <button className="secondary" disabled={hasReachedFreeLimit}>
          Add mode
        </button>
      </form>
      {hasReachedFreeLimit && (
        <p className="hint">Free plans include up to five focus modes.</p>
      )}
    </section>
  );
}

export function SettingsPage() {
  const { flow, togglePremium, updatePreferences } = useFlow();
  return (
    <section className="page settings-page">
      <p className="eyebrow">Make it yours</p>
      <h1>Settings</h1>
      <section className="settings-section">
        <h2>Clock format</h2>
        <div className="segmented">
          {["24h", "12h"].map((format) => (
            <button
              key={format}
              className={
                flow.preferences.clockFormat === format ? "selected" : ""
              }
              onClick={() => updatePreferences({ clockFormat: format })}
            >
              {format === "24h" ? "24-hour" : "12-hour"}
            </button>
          ))}
        </div>
      </section>
      <ThemeSettings />
      <ModeSettings />
      <section className="settings-section premium">
        <div>
          <h2>Premium development preview</h2>
          <p>
            Enables extra modes and custom image backgrounds locally for
            testing. It is not a subscription.
          </p>
        </div>
        <button
          className={flow.premium.enabled ? "toggle on" : "toggle"}
          onClick={togglePremium}
          aria-pressed={flow.premium.enabled}
        >
          <i />
        </button>
      </section>
    </section>
  );
}

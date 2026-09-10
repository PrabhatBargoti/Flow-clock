import { useState } from "react";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Topbar } from "./components/Topbar";
import { FlowProvider } from "./context/FlowContext";
import { useFlow } from "./hooks/useFlow";
import { ActivityPage } from "./pages/ActivityPage";
import { HomePage } from "./pages/HomePage";
import { SettingsPage } from "./pages/SettingsPage";

function AppContent() {
  const [view, setView] = useState("home");
  return (
    <FlowProvider>
      <AppShell view={view} setView={setView}>
        {view === "home" && <HomePage />}
        {view === "activity" && <ActivityPage />}
        {view === "settings" && <SettingsPage />}
      </AppShell>
    </FlowProvider>
  );
}

function AppShell({ children, view, setView }) {
  const { flow, storageAvailable } = useFlow();
  const themeStyle =
    flow.preferences.customTheme && flow.preferences.themeId === "custom"
      ? { "--theme-image": `url(${flow.preferences.customTheme.image})` }
      : undefined;

  return (
    <main className={`app theme-${flow.preferences.themeId}`} style={themeStyle}>
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <Topbar view={view} setView={setView} />
      {!storageAvailable && (
        <p className="notice" role="status">
          Your browser is blocking local storage. Changes will last only until
          this tab closes.
        </p>
      )}
      {children}
    </main>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

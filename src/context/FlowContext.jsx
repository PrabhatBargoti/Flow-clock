import { useEffect, useMemo, useState } from "react";
import {
  defaultModes,
  MAX_FREE_MODES,
  MEANINGFUL_SESSION_MS,
} from "../data/defaults";
import { useStopwatch } from "../hooks/useStopwatch";
import { loadState, saveState } from "../services/storage";
import {
  activityDays,
  activityTotal,
  calculateCurrentStreak,
} from "../utils/streak";
import { localDateKey } from "../utils/time";
import { FlowContext } from "./flowStore";

export function FlowProvider({ children }) {
  const [initial] = useState(() => loadState());
  const [flow, setFlow] = useState(initial.state);
  const storageAvailable = initial.storageAvailable;
  const stopwatch = useStopwatch();

  useEffect(() => {
    saveState(flow);
  }, [flow]);

  const selectedMode =
    flow.modes.find((mode) => mode.id === flow.preferences.selectedModeId) ||
    flow.modes[0];

  const streak = useMemo(
    () => calculateCurrentStreak(flow.activity),
    [flow.activity],
  );
  const totalDuration = useMemo(
    () => activityTotal(flow.activity),
    [flow.activity],
  );
  const grid = useMemo(() => activityDays(flow.activity), [flow.activity]);
  const defaultModeIds = useMemo(
    () => new Set(defaultModes.map((m) => m.id)),
    [],
  );

  const monthlyStats = useMemo(() => {
    const today = new Date();
    const month = today.getMonth();
    const year = today.getFullYear();
    const sessions = flow.sessions.filter((session) => {
      const date = new Date(session.endedAt);
      return (
        session.meaningful &&
        date.getMonth() === month &&
        date.getFullYear() === year
      );
    });
    const byMode = sessions.reduce(
      (counts, session) => ({
        ...counts,
        [session.modeId]: (counts[session.modeId] || 0) + session.durationMs,
      }),
      {},
    );
    const mostUsedId = Object.keys(byMode).sort(
      (a, b) => byMode[b] - byMode[a],
    )[0];
    return {
      duration: sessions.reduce(
        (total, session) => total + session.durationMs,
        0,
      ),
      mostUsedId,
    };
  }, [flow.sessions]);

  const updatePreferences = (patch) =>
    setFlow((current) => ({
      ...current,
      preferences: { ...current.preferences, ...patch },
    }));

  const selectMode = (id) => updatePreferences({ selectedModeId: id });

  function deleteMode(id) {
    if (defaultModeIds.has(id)) return;
    setFlow((current) => {
      const modes = current.modes.filter((m) => m.id !== id);
      const needsFallback = current.preferences.selectedModeId === id;
      return {
        ...current,
        modes,
        preferences: needsFallback
          ? { ...current.preferences, selectedModeId: modes[0]?.id || "study" }
          : current.preferences,
      };
    });
  }

  const togglePremium = () =>
    setFlow((current) => ({
      ...current,
      premium: { enabled: !current.premium.enabled },
    }));

  function completeSession() {
    const completed = stopwatch.reset();
    const durationMs = completed.durationMs;
    if (durationMs < 1000) return;
    const endedAt = new Date().toISOString();
    const meaningful = durationMs >= MEANINGFUL_SESSION_MS;
    const session = {
      id: crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`,
      startedAt: new Date(completed.startedAt).toISOString(),
      endedAt,
      durationMs,
      modeId: selectedMode.id,
      meaningful,
    };
    setFlow((current) => {
      const activity = { ...current.activity };
      if (meaningful) {
        const key = localDateKey(endedAt);
        const old = activity[key] || { totalDurationMs: 0, sessionCount: 0 };
        activity[key] = {
          totalDurationMs: old.totalDurationMs + durationMs,
          sessionCount: old.sessionCount + 1,
        };
      }
      return {
        ...current,
        sessions: [...current.sessions, session].slice(-500),
        activity,
      };
    });
  }

  function addMode(name) {
    const trimmed = name.trim().slice(0, 32);
    if (
      !trimmed ||
      (!flow.premium.enabled && flow.modes.length >= MAX_FREE_MODES)
    )
      return false;
    const id = `${
      trimmed
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") || "mode"
    }-${Date.now()}`;
    const mode = { id, name: trimmed, icon: "✦", accent: "#7c5cff" };
    setFlow((current) => ({
      ...current,
      modes: [...current.modes, mode],
      preferences: { ...current.preferences, selectedModeId: id },
    }));
    return true;
  }

  const value = {
    flow,
    storageAvailable,
    stopwatch,
    selectedMode,
    streak,
    totalDuration,
    grid,
    monthlyStats,
    defaultModeIds,
    updatePreferences,
    selectMode,
    deleteMode,
    togglePremium,
    completeSession,
    addMode,
  };

  return <FlowContext.Provider value={value}>{children}</FlowContext.Provider>;
}

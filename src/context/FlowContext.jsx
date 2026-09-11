import { useEffect, useMemo, useReducer, useState } from "react";
import {
  defaultModes,
  MAX_FREE_MODES,
  MEANINGFUL_SESSION_MS,
  SESSION_HISTORY_LIMIT,
} from "../data/defaults";
import { useStopwatch } from "../hooks/useStopwatch";
import { loadState, saveState } from "../services/storage";
import {
  activityDays,
  activityTotal,
  calculateCurrentStreak,
  calculateLongestStreak,
} from "../utils/streak";
import { localDateKey } from "../utils/time";
import { calculateStats } from "../utils/stats";
import { FlowContext } from "./flowStore";

export function FlowProvider({ children }) {
  const [initial] = useState(() => loadState());
  const [flow, setFlow] = useState(initial.state);
  const [completion, setCompletion] = useState(null);
  const [persistenceError, setPersistenceError] = useReducer(
    (_, value) => value,
    false,
  );
  const storageAvailable = initial.storageAvailable;
  const stopwatch = useStopwatch();

  useEffect(() => {
    setPersistenceError(!saveState(flow));
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
  const longestStreak = useMemo(
    () => calculateLongestStreak(flow.activity),
    [flow.activity],
  );
  const stats = useMemo(() => calculateStats(flow.sessions), [flow.sessions]);
  const defaultModeIds = useMemo(
    () => new Set(defaultModes.map((m) => m.id)),
    [],
  );

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
      const nextStreak = meaningful
        ? calculateCurrentStreak(activity)
        : calculateCurrentStreak(current.activity);
      const unlockedThemes = [...current.rewards.unlockedThemes];
      if (nextStreak >= 7 && !unlockedThemes.includes("light"))
        unlockedThemes.push("light");
      if (nextStreak >= 30 && !unlockedThemes.includes("minimal"))
        unlockedThemes.push("minimal");
      return {
        ...current,
        sessions: [...current.sessions, session].slice(-SESSION_HISTORY_LIMIT),
        activity,
        rewards: { ...current.rewards, unlockedThemes },
      };
    });
    if (meaningful)
      setCompletion({
        mode: selectedMode,
        durationMs,
        streak: calculateCurrentStreak({
          ...flow.activity,
          [localDateKey(endedAt)]: true,
        }),
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
    persistenceError,
    stopwatch,
    selectedMode,
    streak,
    longestStreak,
    totalDuration,
    grid,
    stats,
    defaultModeIds,
    updatePreferences,
    selectMode,
    deleteMode,
    togglePremium,
    completeSession,
    addMode,
    completion,
    dismissCompletion: () => setCompletion(null),
  };

  return <FlowContext.Provider value={value}>{children}</FlowContext.Provider>;
}

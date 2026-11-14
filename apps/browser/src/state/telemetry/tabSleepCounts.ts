const none = () => ({ captureIndicatorsCleared: 0, pinnedTabsSleptByMemorySaver: 0, topAppsKeptRunning: 0, topAppsUnloadedFromMenu: 0 });

let pending = none();

export function noteCaptureIndicatorCleared() {
  pending.captureIndicatorsCleared++;
}

export function noteTabSlept(pinned: boolean, reason: string | null) {
  if (pinned && reason === "proactive") pending.pinnedTabsSleptByMemorySaver++;
}

export function noteTopAppsKeptRunning(count: number) {
  pending.topAppsKeptRunning += count;
}

export function noteTopAppUnloadedFromMenu() {
  pending.topAppsUnloadedFromMenu++;
}

export function takeTabSleepCounts() {
  const taken = pending;
  pending = none();
  return {
    capture_indicators_cleared: taken.captureIndicatorsCleared,
    pinned_tabs_slept_by_memory_saver: taken.pinnedTabsSleptByMemorySaver,
    top_app_closes_kept_running: taken.topAppsKeptRunning,
    top_apps_unloaded_from_menu: taken.topAppsUnloadedFromMenu,
  };
}

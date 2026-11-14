import assert from "node:assert/strict";
import { test } from "node:test";
const { useBrowser } = await import("../browser/store.ts");
const model = await import("../browser/model.ts");
const { menuState } = await import("../commands/menuState.ts");
const { runCommand } = await import("../commands/commands.ts");
const { takeRecentlyClosedCounts } = await import("../telemetry/recentlyClosedCounts.ts");

const S = () => useBrowser.getState();

function closeThree(windowId, prefix) {
  for (const name of ["a", "b", "c"]) {
    const tabId = S().newTab(windowId, { url: `https://${prefix}${name}.example/` });
    S().closeTab(tabId);
  }
}

test("Clear Recently Closed empties the list for the window's profile and leaves other profiles' lists", () => {
  const home = S().createWindow({ url: "https://keep.example/" });
  const work = S().createProfile({ name: "Work" });
  const other = S().createWindow({ url: "https://work.example/", profileId: work });
  closeThree(home, "home-");
  closeThree(other, "work-");
  S().setFocusedWindow(home);
  const homeProfile = S().windows[home].profileId;
  const closedFor = (profile) => S().closedTabs.filter((c) => c.tab.profileId === profile).length;
  assert.equal(closedFor(homeProfile), 3);
  assert.equal(closedFor(work), 3);
  takeRecentlyClosedCounts();

  runCommand({ command: "clearRecentlyClosed", arg: null, windowId: home });
  assert.equal(closedFor(homeProfile), 0);
  assert.equal(closedFor(work), 3);
  const before = S().tabs;
  S().reopenClosed(home);
  assert.equal(S().tabs, before, "⇧⌘T reopens nothing in the cleared profile");
  assert.deepEqual(takeRecentlyClosedCounts(), { recently_closed_clears: 1, recently_closed_entries_cleared: 3 });

  S().clearRecentlyClosed(home);
  assert.deepEqual(takeRecentlyClosedCounts(), { recently_closed_clears: 0, recently_closed_entries_cleared: 0 }, "an empty list counts no clear");
  assert.ok(model.activeTabId(S(), other));
});

test("the menu item is off while the window's Recently Closed list is empty", () => {
  const w = S().createWindow({ url: "https://menu.example/" });
  S().setFocusedWindow(w);
  S().clearRecentlyClosed(w);
  for (const c of S().closedGroups) assert.notEqual(c.tabs[0]?.profileId, S().windows[w].profileId);
  const disabled = () => menuState(S()).disabled.includes("clearRecentlyClosed");
  assert.equal(menuState(S()).recentlyClosed.length, 0);
  assert.ok(disabled());
  S().closeTab(S().newTab(w, { url: "https://menu-closed.example/" }));
  assert.equal(menuState(S()).recentlyClosed.length, 1);
  assert.ok(!disabled());
  runCommand({ command: "clearRecentlyClosed", arg: null, windowId: w });
  assert.equal(menuState(S()).recentlyClosed.length, 0);
});

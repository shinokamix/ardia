export type RowSelection = { selected: ReadonlySet<string>; anchor: string | null; cursor: string | null };

export const NO_ROWS_SELECTED: RowSelection = { selected: new Set(), anchor: null, cursor: null };

function withRange(selected: ReadonlySet<string>, urls: readonly string[], from: number, to: number): Set<string> {
  const next = new Set(selected);
  for (let i = Math.min(from, to); i <= Math.max(from, to); i++) next.add(urls[i]!);
  return next;
}

export function toggledRow(urls: readonly string[], s: RowSelection, url: string, shift: boolean): RowSelection {
  const from = shift && s.anchor ? urls.indexOf(s.anchor) : -1;
  const to = urls.indexOf(url);
  if (from >= 0 && to >= 0) return { selected: withRange(s.selected, urls, from, to), anchor: url, cursor: url };
  const selected = new Set(s.selected);
  if (selected.has(url)) selected.delete(url);
  else selected.add(url);
  return { selected, anchor: url, cursor: url };
}

export function movedCursor(urls: readonly string[], s: RowSelection, step: 1 | -1, extend: boolean): RowSelection {
  if (!urls.length) return s;
  const at = s.cursor ? urls.indexOf(s.cursor) : -1;
  const index = at < 0 ? (step > 0 ? 0 : urls.length - 1) : Math.max(0, Math.min(urls.length - 1, at + step));
  const cursor = urls[index]!;
  if (!extend) return { ...s, anchor: cursor, cursor };
  const anchor = s.anchor && urls.includes(s.anchor) ? s.anchor : at >= 0 ? urls[at]! : cursor;
  return { selected: withRange(s.selected, urls, urls.indexOf(anchor), index), anchor, cursor };
}

export const toggledCursor = (urls: readonly string[], s: RowSelection): RowSelection => (s.cursor && urls.includes(s.cursor) ? toggledRow(urls, s, s.cursor, false) : s);

export const allRows = (urls: readonly string[], s: RowSelection): RowSelection => ({ ...s, selected: new Set(urls) });

export function shownRows(urls: readonly string[], s: RowSelection): RowSelection {
  const shown = new Set(urls);
  const kept = [...s.selected].filter((url) => shown.has(url));
  const cursor = s.cursor && shown.has(s.cursor) ? s.cursor : null;
  const anchor = s.anchor && shown.has(s.anchor) ? s.anchor : null;
  if (kept.length === s.selected.size && cursor === s.cursor && anchor === s.anchor) return s;
  return { selected: kept.length === s.selected.size ? s.selected : new Set(kept), anchor, cursor };
}

export const withoutRows = (s: RowSelection, urls: readonly string[]): RowSelection =>
  urls.some((url) => s.selected.has(url)) ? { ...s, selected: new Set([...s.selected].filter((url) => !urls.includes(url))) } : s;

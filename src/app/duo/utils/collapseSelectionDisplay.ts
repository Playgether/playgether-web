export const SELECTION_COLLAPSE_THRESHOLD = 5;
export const SELECTION_MAX_VISIBLE = 3;

export type CollapsedSelection =
  | { kind: "all"; label: string }
  | { kind: "list"; items: string[]; overflow: number };

export function collapseSelection(
  selected: string[],
  allOptions: readonly string[],
  allLabel: string,
): CollapsedSelection {
  if (selected.length === 0) {
    return { kind: "list", items: [], overflow: 0 };
  }

  const selectedSet = new Set(selected);
  const isAll =
    allOptions.length > 0 && allOptions.every((option) => selectedSet.has(option));

  if (isAll) {
    return { kind: "all", label: allLabel };
  }

  const ordered =
    allOptions.length > 0
      ? allOptions.filter((option) => selectedSet.has(option))
      : [...selected];

  if (ordered.length >= SELECTION_COLLAPSE_THRESHOLD) {
    return {
      kind: "list",
      items: ordered.slice(0, SELECTION_MAX_VISIBLE),
      overflow: ordered.length - SELECTION_MAX_VISIBLE,
    };
  }

  return { kind: "list", items: ordered, overflow: 0 };
}

export function isFullSelection(selected: string[], allOptions: readonly string[]): boolean {
  if (allOptions.length === 0 || selected.length === 0) return false;
  const selectedSet = new Set(selected);
  return allOptions.every((option) => selectedSet.has(option));
}

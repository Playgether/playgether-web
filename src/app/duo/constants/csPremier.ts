/** CS2 Premier point ranges — aligned with duo/strategies/cs.py */
export const PREMIER_RANGES = [
  "0-4999",
  "5000-9999",
  "10000-14999",
  "15000-19999",
  "20000-24999",
  "25000-29999",
  "30000+",
] as const;

export type PremierRange = (typeof PREMIER_RANGES)[number];

/** In-game CS Rating color bands (Gray → Light Blue → Blue → Purple → Pink → Red → Gold). */
export const PREMIER_RANGE_STYLES: Record<
  PremierRange,
  { text: string; border: string; bg: string; dot: string; selectedBorder: string; selectedBg: string }
> = {
  "0-4999": {
    text: "text-gray-400",
    border: "border-gray-500/35",
    bg: "bg-gray-500/10",
    dot: "bg-gray-400",
    selectedBorder: "border-gray-400/70",
    selectedBg: "bg-gray-500/25",
  },
  "5000-9999": {
    text: "text-sky-300",
    border: "border-sky-400/35",
    bg: "bg-sky-400/10",
    dot: "bg-sky-300",
    selectedBorder: "border-sky-400/70",
    selectedBg: "bg-sky-400/20",
  },
  "10000-14999": {
    text: "text-blue-400",
    border: "border-blue-500/35",
    bg: "bg-blue-500/10",
    dot: "bg-blue-400",
    selectedBorder: "border-blue-500/70",
    selectedBg: "bg-blue-500/20",
  },
  "15000-19999": {
    text: "text-purple-400",
    border: "border-purple-500/35",
    bg: "bg-purple-500/10",
    dot: "bg-purple-400",
    selectedBorder: "border-purple-500/70",
    selectedBg: "bg-purple-500/20",
  },
  "20000-24999": {
    text: "text-pink-400",
    border: "border-pink-500/35",
    bg: "bg-pink-500/10",
    dot: "bg-pink-400",
    selectedBorder: "border-pink-500/70",
    selectedBg: "bg-pink-500/20",
  },
  "25000-29999": {
    text: "text-red-400",
    border: "border-red-500/35",
    bg: "bg-red-500/10",
    dot: "bg-red-400",
    selectedBorder: "border-red-500/70",
    selectedBg: "bg-red-500/20",
  },
  "30000+": {
    text: "text-yellow-400",
    border: "border-yellow-500/35",
    bg: "bg-yellow-500/10",
    dot: "bg-yellow-400",
    selectedBorder: "border-yellow-500/70",
    selectedBg: "bg-yellow-500/20",
  },
};

export function premierRangeStyle(range: string) {
  return PREMIER_RANGE_STYLES[range as PremierRange] ?? null;
}

export function premierRangeChipClass(range: string, selected: boolean): string {
  const style = premierRangeStyle(range);
  if (!style) {
    return selected
      ? "border-primary/70 bg-primary/20 text-primary shadow-glow-primary/25"
      : "border-border/70 bg-background/45 text-muted-foreground hover:border-primary/35 hover:text-card-foreground";
  }
  if (selected) {
    return `${style.selectedBorder} ${style.selectedBg} ${style.text} shadow-sm`;
  }
  return `${style.border} ${style.bg} ${style.text} hover:brightness-110`;
}

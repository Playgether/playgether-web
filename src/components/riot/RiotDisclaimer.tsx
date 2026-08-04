import { cn } from "@/lib/utils";

export const RIOT_DISCLAIMER =
  "Playgether isn't endorsed by Riot Games and doesn't reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games properties. Riot Games, and all associated properties are trademarks or registered trademarks of Riot Games, Inc.";

export function RiotDisclaimer({ className }: { className?: string }) {
  return (
    <aside
      aria-label="Riot Games legal notice"
      className={cn(
        "rounded-lg border border-border/70 bg-muted/40 px-3 py-2 text-xs leading-relaxed text-muted-foreground",
        className,
      )}
    >
      {RIOT_DISCLAIMER}
    </aside>
  );
}

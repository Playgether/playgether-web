import React from "react";

export const ConquistText = ({
  text,
  title,
  Icon,
  date,
}: {
  text: string;
  title: string;
  Icon?: React.ReactNode;
  date: string;
}) => {
  return (
    <div className="w-full rounded-xl border border-border/50 bg-card/30 p-4 hover:shadow-glow transition-all duration-200">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-lg bg-gradient-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
          {Icon ? <div className="scale-75">{Icon}</div> : <span>🏆</span>}
        </div>

        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-start justify-between gap-3">
            <h4 className="font-semibold text-card-foreground">{title}</h4>
            <span className="text-xs text-muted-foreground px-2 py-1 rounded border border-border/50 bg-muted/30 whitespace-nowrap">
              {date}
            </span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {text}
          </p>
        </div>
      </div>
    </div>
  );
};

"use client";

/**
 * Emblemas de elo (CDragon) vêm com bastante área transparente; ampliamos e cortamos no quadro.
 * Mesmo componente e defaults de ProfileGameStatsSection (overview ranqueada).
 */
export function LolRankEmblemFrame({
  src,
  alt,
  frameClass,
  zoomPercent = 182,
}: {
  src: string;
  alt: string;
  /** Classes de tamanho do container, ex: h-11 w-11 */
  frameClass: string;
  /** Largura/altura da imagem em % do container (maior = mais “zoom”) */
  zoomPercent?: number;
}) {
  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-xl border border-border/70 bg-gradient-to-b from-muted/40 to-muted/15 shadow-inner ${frameClass}`}
    >
      <img
        src={src}
        alt={alt}
        className="pointer-events-none absolute left-1/2 top-1/2 max-h-none max-w-none -translate-x-1/2 -translate-y-1/2 object-cover object-center"
        style={{ width: `${zoomPercent}%`, height: `${zoomPercent}%` }}
      />
    </div>
  );
}

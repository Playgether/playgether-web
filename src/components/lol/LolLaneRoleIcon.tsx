"use client";

import { lolLaneIconUrlForDuoRole } from "./lolLaneIconUrl";

/** Mesmo recorte que “Roles por filtro” no overview (h-5 w-5 + 118%). */
export function LolLaneRoleIcon({
  roleLabel,
  className = "",
}: {
  roleLabel: string;
  /** Classes extras no wrapper (ex.: h-6 w-6 para linhas maiores) */
  className?: string;
}) {
  const src = lolLaneIconUrlForDuoRole(roleLabel);
  if (!src) return null;
  return (
    <span
      className={`relative flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-sm bg-transparent ${className}`}
    >
      <img
        src={src}
        alt=""
        className="h-[118%] w-[118%] max-w-none object-cover object-center"
        title={roleLabel}
      />
    </span>
  );
}

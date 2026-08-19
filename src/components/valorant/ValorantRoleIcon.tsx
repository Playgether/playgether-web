"use client";

import { cn } from "@/lib/utils";
import { valorantRoleIconUrlForDuoRole } from "@/lib/valorantRoleIcon";

export function ValorantRoleIcon({
  roleLabel,
  className,
}: {
  roleLabel: string;
  /** Sobrescreve tamanho do quadro, ex.: `h-3.5 w-3.5` para chips compactos. */
  className?: string;
}) {
  const src = valorantRoleIconUrlForDuoRole(roleLabel);
  if (!src) return null;
  return (
    <span
      className={cn(
        "relative flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-sm bg-transparent",
        className,
      )}
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

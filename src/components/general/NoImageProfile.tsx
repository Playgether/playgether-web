import React from "react";
import { twMerge } from "tailwind-merge";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";

interface NoImageProfileProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Nome completo para gerar as duas iniciais (primeiro + último nome). */
  displayName?: string;
  username?: string;
  /** @deprecated Substituído por iniciais; mantido só por compatibilidade. */
  iconClassName?: string;
  sizeClass?: string;
}

/**
 * Placeholder quando não há foto: gradiente + duas iniciais (mesmo padrão do `ProfileAvatar`).
 * Passe sempre `displayName` quando souber o nome do usuário.
 */
export default function NoImageProfile({
  displayName = "?",
  username,
  iconClassName: _ignored,
  sizeClass = "h-12 w-12",
  className,
  ...rest
}: NoImageProfileProps) {
  return (
    <div className={twMerge("relative inline-flex", className)} {...rest}>
      <ProfileAvatar
        displayName={displayName}
        username={username}
        profilePhoto={null}
        sizeClass={sizeClass}
        fallbackTextClassName="text-sm"
      />
    </div>
  );
}

/** Formata aviso de silenciamento para o usuário alvo. */
export function formatMuteNotice(opts: {
  duration_seconds?: number | null;
  expires_at?: string | null;
  remaining_seconds?: number | null;
}): string {
  const remaining =
    opts.remaining_seconds != null && Number.isFinite(opts.remaining_seconds)
      ? Math.max(0, Math.round(opts.remaining_seconds))
      : null;

  let seconds = remaining;
  if (seconds == null && opts.expires_at) {
    const end = new Date(opts.expires_at).getTime();
    if (!Number.isNaN(end)) {
      seconds = Math.max(0, Math.round((end - Date.now()) / 1000));
    }
  }
  if (seconds == null && opts.duration_seconds != null && opts.duration_seconds > 0) {
    seconds = Math.round(opts.duration_seconds);
  }

  if (seconds == null || opts.duration_seconds === null) {
    if (!opts.expires_at && opts.duration_seconds === null) {
      return "Você foi silenciado permanentemente nesta sala.";
    }
  }

  if (seconds == null || seconds <= 0) {
    return "Você foi silenciado nesta sala.";
  }

  if (seconds < 60) {
    return `Você foi silenciado por ${seconds} segundo${seconds === 1 ? "" : "s"}.`;
  }

  const minutes = Math.ceil(seconds / 60);
  if (minutes < 60) {
    return `Você foi silenciado por ${minutes} minuto${minutes === 1 ? "" : "s"}.`;
  }

  const hours = Math.ceil(minutes / 60);
  if (hours < 24) {
    return `Você foi silenciado por ${hours} hora${hours === 1 ? "" : "s"}.`;
  }

  const days = Math.ceil(hours / 24);
  return `Você foi silenciado por ${days} dia${days === 1 ? "" : "s"}.`;
}

export type RoomActiveMute = {
  expires_at: string | null;
  remaining_seconds: number | null;
  is_permanent: boolean;
};

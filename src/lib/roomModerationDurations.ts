/** Durações para silenciar ou banir (null = permanente). */
export const ROOM_MODERATION_DURATIONS: {
  label: string;
  seconds: number | null;
}[] = [
  { label: "1 minuto", seconds: 60 },
  { label: "5 minutos", seconds: 300 },
  { label: "15 minutos", seconds: 900 },
  { label: "30 minutos", seconds: 1800 },
  { label: "1 hora", seconds: 3600 },
  { label: "6 horas", seconds: 21600 },
  { label: "1 dia", seconds: 86400 },
  { label: "7 dias", seconds: 604800 },
  { label: "30 dias", seconds: 2592000 },
  { label: "Permanente", seconds: null },
];

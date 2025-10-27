export type actionType = "delete" | "pin" | "block" | "remove" | "mute";

export const alertActionMessageConfig: Record<actionType, string> = {
  delete: "Tem certeza que deseja deletar este post?",
  pin: "Tem certeza que deseja fixar este post no seu perfil?",
  block: "Tem certeza que deseja bloquear este usuário?",
  remove: "Tem certeza que deseja remover este post do seu feed?",
  mute: "Tem certeza que deseja silenciar este usuário?",
};

export const getAlertActionMessage = (action: actionType) => {
  return alertActionMessageConfig[action];
};

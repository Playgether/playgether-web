export type actionType = "delete" | "pin" | "block" | "remove" | "mute" | "report" | "toggle_comments";

export const alertActionMessageConfig: Record<actionType, string> = {
  delete: "Tem certeza que deseja deletar este post? Esta ação não pode ser desfeita.",
  pin: "Tem certeza que deseja fixar este post no seu perfil?",
  block: "Tem certeza que deseja bloquear este usuário? Você não verá mais os posts dele.",
  remove: "Tem certeza que deseja remover este post do seu feed?",
  mute: "Tem certeza que deseja silenciar este usuário? Os posts dele não aparecerão mais para você.",
  report: "Tem certeza que deseja denunciar este post? Nossa equipe irá analisá-lo em breve.",
  toggle_comments: "Tem certeza que deseja alterar a configuração de comentários deste post?",
};

export const getAlertActionMessage = (action: actionType) => {
  return alertActionMessageConfig[action];
};

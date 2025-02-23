export type NotificationWrapperProps = {
  children: React.ReactNode;
};

/** Este é o componente responsável por cada notificação do componente Notification, em "Right" na página de feed. */
export const NotificationWrapper = ({ children }: NotificationWrapperProps) => {
  return (
    <div className="flex items-center justify-start space-x-2 pt-2 flex-wrap">
      {children}
    </div>
  );
};

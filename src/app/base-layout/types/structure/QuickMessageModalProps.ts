export interface QuickMessageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message?: {
    id: string;
    user: {
      name: string;
      username?: string;
      avatar: string;
    };
    message: string;
    timeRemaining: string;
    priority: "high" | "medium" | "low";
    fullContent?: string;
  };
  onReply?: () => void;
}

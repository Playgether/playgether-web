export interface NotificationProps {
  object_id: number;
  message: string;
  actors: any[];
  timestamp: Date;
  content_type: number;
  notification_type: string;
  id?: string;
  read?: boolean;
}

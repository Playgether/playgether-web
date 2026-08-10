export type NotificationActor = {
  name: string;
  username: string;
  profile_photo?: string | null;
};

export interface NotificationProps {
  object_id: number;
  message: string;
  actors: NotificationActor[];
  timestamp: Date;
  content_type: number;
  notification_type: string;
  action_url?: string | null;
  id?: string;
  read?: boolean;
}

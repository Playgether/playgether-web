export type NotificationActor = {
  name: string;
  username: string;
  profile_photo?: string | null;
  /** String form of the user PK (UUID or int). */
  user_id?: number | string;
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

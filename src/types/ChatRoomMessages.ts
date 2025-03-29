export interface ChatRoomMessages {
  id: number;
  author_name: string;
  author_username: string;
  author_profile_photo: string;
  body: string;
  created_at: Date;
  viewed: boolean;
}

export interface ChatRoomMessagesPagination {
  next: string;
  previous: string;
  results: ChatRoomMessages[];
}

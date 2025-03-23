export interface ChatRoom {
  id: number;
  group_name: string;
  banner: string;
  summary: string;
  description: string;
  people_quantity: string;
}

export interface ChatRoomPagination {
  next: string;
  previous: string;
  results: ChatRoom[];
}

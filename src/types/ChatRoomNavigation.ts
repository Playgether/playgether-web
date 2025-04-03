import { ChatRoom } from "./ChatRoom";
import { ChatRoomMessages } from "./ChatRoomMessages";

export interface ChatRoomNavigationProps {
  messages: ChatRoomMessages[];
  key: string;
  room: ChatRoom;
}

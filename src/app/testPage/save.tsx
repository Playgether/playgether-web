import { getChat } from "@/services/getChat";
import Component from "./Component";
import { cookies } from "next/headers";

const Chat = async ({}) => {
  const chatroom = "public-chat";
  const accessToken = (await cookies()).get("accessToken")?.value;

  return (
    <div>
      <Component chatroom={chatroom} token={accessToken} />
    </div>
  );
};

export default Chat;
import Component from "./Component";

const Chat = async ({}) => {
  const chatroom = "public-chat";

  return (
    <div>
      <Component chatroom={chatroom} />
    </div>
  );
};

export default Chat;
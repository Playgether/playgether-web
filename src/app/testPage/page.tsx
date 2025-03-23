import { getChat } from "@/services/getChat";
import Component from "./Component";
import { cookies } from "next/headers";
import Chat from "@/components/elements/Chat/Chat";
import BaseLayout from "@/components/layouts/BaseLayout";

const testPage = async ({}) => {
  const chatroom = "psychedelic";
  const accessToken = (await cookies()).get("accessToken")?.value;

  return (
    <BaseLayout>
      <Component chatroom={chatroom} token={accessToken} />
      {/* <Chat /> */}
    </BaseLayout>
  );
};

export default testPage;

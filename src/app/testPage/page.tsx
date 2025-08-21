import Component from "./Component";
import { cookies } from "next/headers";
import BaseLayout from "@/components/layouts/BaseLayout";
import ClientComponent from "./ClientComponent";
import ServerComponent from "./ServerComponent";
import DefaultButtonWrapper from "./DefaultButtonWrapper";

const testPage = async ({}) => {
  const chatroom = "psychedelic";
  const accessToken = (await cookies()).get("accessToken")?.value;

  return (
    // <BaseLayout>
    //   <Component chatroom={chatroom} token={accessToken} />
    // </BaseLayout>
    <div className="flex justify-center items-center h-screen w-screen">
      <ClientComponent>
        {(someText) => <ServerComponent someText={someText} />}
      </ClientComponent>
    </div>
  );
};

export default testPage;

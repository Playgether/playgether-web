import BaseLayout from "@/components/layouts/BaseLayout";
import Page from "@/components/pages/profile/Page";

export interface Props {
  params?: { username: string };
}
export default function Profile({ params }: Props) {
  return (
    <BaseLayout>
      <Page params={params} />
    </BaseLayout>
  );
}

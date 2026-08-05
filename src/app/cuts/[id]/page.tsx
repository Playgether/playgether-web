import { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import BaseLayout from "../../base-layout/components/structure/BaseLayout";
import { getCuts, getCutById } from "@/actions/getCuts";
import { CutsViewer } from "../components/CutsViewer";

export const metadata: Metadata = {
  title: "Playgether - Cuts",
  description: "Vídeos curtos da comunidade gamer",
};

export default async function CutDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cookieStore = await cookies();
  const isAuthenticated = !!cookieStore.get("accessToken")?.value;

  const [cut, feed] = await Promise.all([getCutById(id), getCuts()]);
  if (!cut) notFound();

  const initialCuts = [cut, ...feed.data.filter((c) => c.id !== cut.id)];

  return (
    <BaseLayout>
      <div className="flex h-layout-main min-h-0 w-full overflow-hidden bg-black lg:pl-20">
        <CutsViewer
          initialCuts={initialCuts}
          initialNext={feed.next}
          isAuthenticated={isAuthenticated}
        />
      </div>
    </BaseLayout>
  );
}

"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useFeedContext } from "../context/FeedContext";

export function OpenCreatePostFromQuery() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const { handleCreatePostModal } = useFeedContext();

  useEffect(() => {
    if (searchParams?.get("openCreate") === "1") {
      handleCreatePostModal(true);
      const params = new URLSearchParams(searchParams.toString());
      params.delete("openCreate");
      const nextUrl = `${pathname}${params.toString() ? `?${params.toString()}` : ""}`;
      router.replace(nextUrl, { scroll: false });
    }
  }, [searchParams, handleCreatePostModal, pathname]);

  return null;
}

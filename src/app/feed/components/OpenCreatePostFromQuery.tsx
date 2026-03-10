"use client";

import { useEffect } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import { useFeedContext } from "../context/FeedContext";

export function OpenCreatePostFromQuery() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { handleCreatePostModal } = useFeedContext();

  useEffect(() => {
    if (searchParams.get("openCreate") === "1") {
      handleCreatePostModal(true);
      const url = new URL(window.location.href);
      url.searchParams.delete("openCreate");
      window.history.replaceState(
        {},
        "",
        url.pathname + (url.search || "")
      );
    }
  }, [searchParams, handleCreatePostModal, pathname]);

  return null;
}

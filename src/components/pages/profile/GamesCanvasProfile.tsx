"use client";

import { useState, useRef, useEffect } from "react";
import type { getProfileByUsernameProps } from "@/services/getProfileByUsername";
import { ApiResponseComments } from "@/context/CommentsContext";
import { GamesCanvasUserProfile } from "./GamesCanvasUserProfile";
import { GamesCanvasContentTabs } from "./GamesCanvasContentTabs";
import { ProfilePostsProvider } from "@/app/profile/context/ProfilePostsContext";
import ProfileFeedServerComponentsProvider from "@/app/profile/context/ProfileFeedServerComponentsProvider";

export default function GamesCanvasProfile({
  profile: initialProfile,
  initialComments,
}: {
  profile: getProfileByUsernameProps | null;
  initialComments: ApiResponseComments;
}) {
  const [profile, setProfile] = useState<getProfileByUsernameProps | null>(
    initialProfile
  );

  const handleProfileUpdated = (updated: Partial<getProfileByUsernameProps>) => {
    setProfile((prev) => (prev ? { ...prev, ...updated } : prev));
  };

  // When a Dialog opens, react-remove-scroll-bar adds data-scroll-locked + overflow:hidden
  // to body, which breaks position:sticky. This freezes the card at its current visual
  // position when locked, then restores sticky when the modal closes.
  const stickyRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = stickyRef.current;
    if (!el) return;

    let lastTop = 0;
    let lastLeft = 0;
    let lastWidth = 0;

    const capture = () => {
      if (window.innerWidth >= 1024) {
        const rect = el.getBoundingClientRect();
        lastTop = rect.top;
        lastLeft = rect.left;
        lastWidth = el.offsetWidth;
      }
    };

    window.addEventListener("scroll", capture, { passive: true });
    window.addEventListener("resize", capture, { passive: true });
    capture();

    const mo = new MutationObserver(() => {
      const locked = document.body.hasAttribute("data-scroll-locked");
      if (locked && window.innerWidth >= 1024) {
        el.style.position = "fixed";
        el.style.top = `${lastTop}px`;
        el.style.left = `${lastLeft}px`;
        el.style.width = `${lastWidth}px`;
      } else if (!locked) {
        el.style.position = "";
        el.style.top = "";
        el.style.left = "";
        el.style.width = "";
      }
    });

    mo.observe(document.body, {
      attributes: true,
      attributeFilter: ["data-scroll-locked"],
    });

    return () => {
      mo.disconnect();
      window.removeEventListener("scroll", capture);
      window.removeEventListener("resize", capture);
    };
  }, []);

  return (
    <div className="min-h-layout-main min-w-0 max-w-full bg-background layout-content-offset">
      <div className="mx-auto w-full max-w-7xl px-4 py-4 lg:py-4 xl:px-6 xl:py-6">
        <ProfileFeedServerComponentsProvider>
          <ProfilePostsProvider
            profileUsername={profile?.username}
            onPostAddedToCache={() =>
              handleProfileUpdated({
                quantity_posts: Number(profile?.quantity_posts || 0) + 1,
              })
            }
          >
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[260px_1fr] lg:gap-5 xl:grid-cols-4 xl:gap-6">
              <div className="order-1 min-w-0 lg:order-2 xl:col-span-3">
                <GamesCanvasContentTabs
                  profile={profile}
                  initialComments={initialComments}
                  onProfileUpdated={handleProfileUpdated}
                />
              </div>

              <div className="order-2 hidden min-w-0 lg:order-1 lg:block xl:col-span-1">
                <div
                  ref={stickyRef}
                  className="lg:sticky lg:top-[calc(var(--layout-header-height)+1rem)]"
                >
                  <GamesCanvasUserProfile
                    profile={profile}
                    variant="full"
                    onProfileUpdated={handleProfileUpdated}
                  />
                </div>
              </div>
            </div>
          </ProfilePostsProvider>
        </ProfileFeedServerComponentsProvider>
      </div>
    </div>
  );
}

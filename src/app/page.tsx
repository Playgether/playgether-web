import Video from "../components/pages/index/Video";
import ContentSection from "../components/pages/index/ContentSection";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "Playgether" },
  description: "Home page",
};

export default function Initial() {
  return (
    <div className="relative isolate min-h-screen overflow-x-hidden">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <Video />
        <div className="absolute inset-0 bg-background/10 dark:bg-background/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/20 via-transparent to-background/10 dark:from-background/80 dark:to-background/40" />
      </div>
      <ContentSection />
    </div>
  );
}

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
        <div className="absolute inset-0 hidden bg-background/60 dark:block" />
        <div className="absolute inset-0 hidden bg-gradient-to-t from-background/80 via-transparent to-background/40 dark:block" />
      </div>
      <ContentSection />
    </div>
  );
}

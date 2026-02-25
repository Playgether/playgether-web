import Video from "../components/pages/index/Video";
import ContentSection from "../components/pages/index/ContentSection";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Playgether - Index",
  description: "Home page",
};

export default function Initial() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <Video />
      <div className="absolute inset-0 bg-background/60" />
      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-background/40" />
      <ContentSection />
    </div>
  );
}

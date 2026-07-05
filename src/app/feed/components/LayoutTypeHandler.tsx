"use client";
import React from "react";
import { useFeedServerContext } from "../context/FeedServerContext";

export default function LayoutTypeHandler({
  CenterColumn,
}: {
  CenterColumn: JSX.Element;
}) {
  const { Feed } = useFeedServerContext();
  const components = Feed.ServerFeedPage.components;

  return (
    <div className="lg:grid lg:grid-cols-12 lg:gap-4 lg:pb-10 xl:gap-6 2xl:gap-8">
      {components.LeftColumn}
      {CenterColumn}
      {components.RightColumn}
    </div>
  );
}

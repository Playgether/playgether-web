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
    <div className="lg:grid lg:grid-cols-12 lg:gap-8 lg:pb-10">
      <div className="hidden lg:contents">{components.LeftColumn}</div>
      {CenterColumn}
      <div className="hidden lg:contents">{components.RightColumn}</div>
    </div>
  );
}

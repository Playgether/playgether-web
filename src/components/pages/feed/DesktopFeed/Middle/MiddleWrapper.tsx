import React from "react";
import MiddlePosts from "./MiddlePosts";
import MiddleIsFetching from "./MiddleIsFetching";

function MiddleWrapper() {
  return (
    <div className="h-full mt-4 pb-14 space-y-4 Middle-wrapper w-full">
      <MiddlePosts />
      <MiddleIsFetching />
    </div>
  );
}

export default MiddleWrapper;

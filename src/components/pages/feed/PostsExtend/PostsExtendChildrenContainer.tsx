import React from "react";

function PostsExtendChildrenContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed z-50 flex left-0 right-0 justify-center bottom-[65px] mx-auto w-full bg-white shadow-lg bg-black-300 bg-opacity-50"
      style={{ height: "calc(100vh - 65px)" }}
    >
      {children}
    </div>
  );
}

export default PostsExtendChildrenContainer;

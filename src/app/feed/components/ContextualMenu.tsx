import React from "react";

export default function ContextualMenu({
  text,
  icon,
}: {
  text: string;
  icon: JSX.Element;
}) {
  return (
    <>
      {icon}
      <span>{text}</span>
    </>
  );
}

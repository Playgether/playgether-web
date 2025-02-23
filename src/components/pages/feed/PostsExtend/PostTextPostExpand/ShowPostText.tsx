import React from "react";

function ShowPostText({ text }: { text: string }) {
  return (
    <div className="pt-4 pl-4 pb-4">
      <p>{text}</p>
    </div>
  );
}

export default ShowPostText;

import { Fragment } from "react";

const CUT_WORD_PATTERN = /(\bcut\b)/gi;

export function NotificationMessageText({ text }: { text: string }) {
  const parts = text.split(CUT_WORD_PATTERN);

  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === "cut" ? (
          <span key={index} className="font-semibold text-primary">
            Cut
          </span>
        ) : (
          <Fragment key={index}>{part}</Fragment>
        ),
      )}
    </>
  );
}

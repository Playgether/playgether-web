import { useEffect, useRef } from "react";

function ScrollToBottom({
  children,
  resetFunction,
  shouldScroll,
  target,
}: {
  shouldScroll?: boolean;
  resetFunction?: () => void;
  children?: React.ReactNode;
  target?: string;
}) {
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    let scrollTarget: HTMLElement | null = null;

    if (target) {
      scrollTarget = document.getElementById(target);
    }

    if (!scrollTarget) {
      scrollTarget = endOfMessagesRef.current;
    }

    scrollTarget?.scrollIntoView({ behavior: "smooth" });

    if (resetFunction) resetFunction();
  };

  useEffect(() => {
    if (shouldScroll) {
      scrollToBottom();
    }
  }, [shouldScroll, target]);

  return (
    <>
      <div ref={endOfMessagesRef} className="h-2" />
      <div
        className={`cursor-pointer sticky bottom-0 ${children ? "" : "h-1"}`} // Garante visibilidade sem conteúdo
        onClick={scrollToBottom}
      >
        {children}
      </div>
    </>
  );
}

export default ScrollToBottom;

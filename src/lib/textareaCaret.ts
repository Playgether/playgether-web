const MIRROR_PROPERTIES = [
  "direction",
  "boxSizing",
  "width",
  "height",
  "overflowX",
  "overflowY",
  "borderTopWidth",
  "borderRightWidth",
  "borderBottomWidth",
  "borderLeftWidth",
  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft",
  "fontStyle",
  "fontVariant",
  "fontWeight",
  "fontStretch",
  "fontSize",
  "lineHeight",
  "fontFamily",
  "textAlign",
  "textTransform",
  "textIndent",
  "textDecoration",
  "letterSpacing",
  "wordSpacing",
  "tabSize",
] as const;

type MirrorStyle = CSSStyleDeclaration & Record<(typeof MIRROR_PROPERTIES)[number], string>;

export type TextareaCaretCoordinates = {
  top: number;
  left: number;
  lineHeight: number;
};

export function getTextareaCaretCoordinates(
  element: HTMLTextAreaElement,
  position: number,
): TextareaCaretCoordinates {
  const style = window.getComputedStyle(element);
  const mirror = document.createElement("div");
  const mirrorStyle = mirror.style as MirrorStyle;
  const computed = style as MirrorStyle;

  mirror.setAttribute("aria-hidden", "true");
  mirrorStyle.position = "absolute";
  mirrorStyle.visibility = "hidden";
  mirrorStyle.whiteSpace = "pre-wrap";
  mirrorStyle.wordWrap = "break-word";
  mirrorStyle.top = "0";
  mirrorStyle.left = "-9999px";

  for (const property of MIRROR_PROPERTIES) {
    mirrorStyle[property] = computed[property];
  }

  mirrorStyle.width = `${element.offsetWidth}px`;

  const textBefore = element.value.slice(0, position);
  const textAfter = element.value.slice(position) || ".";

  mirror.textContent = textBefore;
  const marker = document.createElement("span");
  marker.textContent = textAfter;
  mirror.appendChild(marker);

  document.body.appendChild(mirror);

  const markerTop = marker.offsetTop;
  const lineHeight =
    Number.parseFloat(style.lineHeight) ||
    Number.parseFloat(style.fontSize) * 1.2 ||
    20;

  document.body.removeChild(mirror);

  const rect = element.getBoundingClientRect();
  const borderTop = Number.parseFloat(style.borderTopWidth) || 0;
  const borderLeft = Number.parseFloat(style.borderLeftWidth) || 0;
  const paddingTop = Number.parseFloat(style.paddingTop) || 0;
  const paddingLeft = Number.parseFloat(style.paddingLeft) || 0;

  return {
    top: rect.top + borderTop + paddingTop + markerTop - element.scrollTop,
    left: rect.left + borderLeft + paddingLeft + marker.offsetLeft - element.scrollLeft,
    lineHeight,
  };
}

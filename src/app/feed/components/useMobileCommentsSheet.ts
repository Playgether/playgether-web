"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import {
  animate,
  useDragControls,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type PanInfo,
} from "framer-motion";
import { useIsLgDesktop } from "@/hooks/use-lg-desktop";

export const MOBILE_COMMENTS_HANDLE_HEIGHT = 44;

/** Far below the viewport until the sheet is measured — keeps default collapsed. */
const UNMEASURED_Y = 10000;

type SetExpanded = Dispatch<SetStateAction<boolean>>;

export function useMobileCommentsSheet(
  expanded: boolean,
  setExpanded: SetExpanded,
  postId: string,
) {
  const isLgDesktop = useIsLgDesktop();
  const reduceMotion = useReducedMotion();
  const [containerEl, setContainerEl] = useState<HTMLDivElement | null>(null);
  const containerRef = useCallback((node: HTMLDivElement | null) => {
    setContainerEl(node);
  }, []);
  const [sheetMaxY, setSheetMaxY] = useState(0);
  const sheetY = useMotionValue(UNMEASURED_Y);
  const isDraggingRef = useRef(false);
  const hasMeasuredRef = useRef(false);
  const dragDistanceRef = useRef(0);
  const dragControls = useDragControls();
  const expandedRef = useRef(expanded);
  expandedRef.current = expanded;

  const captionOpacity = useTransform(sheetY, (y) => {
    if (sheetMaxY <= 0) return expanded ? 0 : 1;
    return Math.min(1, Math.max(0, y / sheetMaxY));
  });

  const captionY = useTransform(sheetY, (y) => {
    if (sheetMaxY <= 0) return 0;
    const progress = Math.min(1, Math.max(0, y / sheetMaxY));
    return (1 - progress) * 16;
  });

  const textHeroOpacity = useTransform(sheetY, (y) => {
    if (sheetMaxY <= 0) return expanded ? 0.4 : 1;
    const progress = Math.min(1, Math.max(0, y / sheetMaxY));
    return 0.4 + progress * 0.6;
  });

  useLayoutEffect(() => {
    hasMeasuredRef.current = false;

    if (isLgDesktop) {
      sheetY.set(0);
      setSheetMaxY(0);
      return;
    }

    if (!containerEl) {
      sheetY.set(expandedRef.current ? 0 : UNMEASURED_Y);
      setSheetMaxY(0);
      return;
    }

    const applyPosition = (maxY: number, animateTo = false) => {
      const target = expandedRef.current ? 0 : maxY;
      if (!animateTo || reduceMotion || !hasMeasuredRef.current) {
        sheetY.set(target);
        return;
      }
      if (Math.abs(sheetY.get() - target) < 1) return;
      animate(sheetY, target, {
        type: "spring",
        stiffness: 420,
        damping: 38,
        mass: 0.85,
      });
    };

    const measure = () => {
      const maxY = Math.max(
        0,
        containerEl.clientHeight - MOBILE_COMMENTS_HANDLE_HEIGHT,
      );
      if (maxY <= 0) return;

      setSheetMaxY(maxY);

      if (isDraggingRef.current) return;

      if (!hasMeasuredRef.current) {
        applyPosition(maxY, false);
        hasMeasuredRef.current = true;
        return;
      }

      // Keep collapsed/expanded snap if the shell resized
      applyPosition(maxY, false);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(containerEl);
    return () => ro.disconnect();
  }, [isLgDesktop, postId, sheetY, containerEl, reduceMotion]);

  useEffect(() => {
    if (isLgDesktop || sheetMaxY <= 0 || isDraggingRef.current) return;
    if (!hasMeasuredRef.current) return;

    const target = expanded ? 0 : sheetMaxY;
    if (Math.abs(sheetY.get() - target) < 1) return;

    if (reduceMotion) {
      sheetY.set(target);
      return;
    }

    const controls = animate(sheetY, target, {
      type: "spring",
      stiffness: 420,
      damping: 38,
      mass: 0.85,
    });
    return () => controls.stop();
  }, [expanded, sheetMaxY, isLgDesktop, reduceMotion, sheetY]);

  const onDragStart = () => {
    isDraggingRef.current = true;
    dragDistanceRef.current = 0;
  };

  const onDrag = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    dragDistanceRef.current = Math.max(
      dragDistanceRef.current,
      Math.abs(info.offset.y),
    );
  };

  const onDragEnd = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    isDraggingRef.current = false;
    const current = sheetY.get();
    const velocity = info.velocity.y;

    let nextExpanded = expanded;
    if (velocity < -500) nextExpanded = true;
    else if (velocity > 500) nextExpanded = false;
    else nextExpanded = current < sheetMaxY * 0.45;

    const target = nextExpanded ? 0 : sheetMaxY;
    if (reduceMotion) {
      sheetY.set(target);
    } else {
      animate(sheetY, target, {
        type: "spring",
        stiffness: 420,
        damping: 38,
        mass: 0.85,
      });
    }

    setExpanded(nextExpanded);
  };

  const onHandleClick = () => {
    if (dragDistanceRef.current > 8) {
      dragDistanceRef.current = 0;
      return;
    }
    setExpanded((v) => !v);
  };

  return {
    isLgDesktop,
    containerRef,
    sheetY,
    sheetMaxY,
    captionOpacity,
    captionY,
    textHeroOpacity,
    dragControls,
    onDragStart,
    onDrag,
    onDragEnd,
    onHandleClick,
  };
}

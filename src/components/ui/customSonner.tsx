"use client";

import React, { ReactNode } from "react";
import Link from "next/link";
import { toast, type ExternalToast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaExclamationCircle,
  FaInfoCircle,
} from "react-icons/fa";
import { twMerge } from "tailwind-merge";

interface CustomSonnerProps {
  message: React.ReactNode;
  type: string;
  description?: React.ReactNode;
  action?: { label: string; onClick: () => void };
  link?: { label: string; href: string };
}

type ToastStyle = {
  container: string;
  icon: string;
  title: string;
  description: string;
  action: string;
  link: string;
};

function getToastStyle(type: string): ToastStyle {
  const base = {
    container:
      "border border-border/60 bg-card text-foreground shadow-none",
    title: "text-sm font-semibold leading-snug",
    description: "mt-1 text-xs leading-relaxed text-muted-foreground",
    action:
      "w-full rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90",
    link:
      "w-full rounded-lg border border-border/70 bg-transparent px-3 py-2 text-center text-sm font-semibold text-primary transition-colors hover:bg-primary/10",
  };

  switch (type) {
    case "success":
      return {
        ...base,
        container: twMerge(base.container, "border-emerald-500/30"),
        icon: "text-emerald-400",
      };
    case "error":
      return {
        ...base,
        container: twMerge(base.container, "border-destructive/30"),
        icon: "text-destructive",
      };
    case "info":
      return {
        ...base,
        container: twMerge(base.container, "border-blue-500/30"),
        icon: "text-blue-400",
      };
    case "warning":
      return {
        ...base,
        container: twMerge(base.container, "border-amber-500/30"),
        icon: "text-amber-400",
      };
    case "neutral":
      return {
        ...base,
        icon: "text-muted-foreground",
      };
    default:
      return {
        ...base,
        icon: "text-foreground",
      };
  }
}

function getIcon(type: string): ReactNode {
  const iconClass = "h-4 w-4 shrink-0";
  switch (type) {
    case "success":
      return <FaCheckCircle className={iconClass} />;
    case "error":
      return <FaExclamationCircle className={iconClass} />;
    case "info":
      return <FaInfoCircle className={iconClass} />;
    case "warning":
      return <FaExclamationTriangle className={iconClass} />;
    case "neutral":
      return <FaInfoCircle className={iconClass} />;
    default:
      return null;
  }
}

const CustomSonner = ({
  message,
  type,
  description,
  action,
  link,
  toastId,
}: CustomSonnerProps & { toastId?: string | number }) => {
  const styles = getToastStyle(type);
  const icon = getIcon(type);
  const hasFooter = Boolean(action || link);

  const dismiss = () => {
    if (toastId !== undefined) toast.dismiss(toastId);
  };

  return (
    <div
      className={twMerge(
        "w-[min(100vw-2rem,22rem)] overflow-hidden rounded-xl",
        styles.container,
      )}
    >
      <div className="flex gap-3 p-4">
        {icon ? (
          <span className={twMerge("mt-0.5", styles.icon)}>{icon}</span>
        ) : null}
        <div className="min-w-0 flex-1">
          <p className={styles.title}>{message}</p>
          {description ? <p className={styles.description}>{description}</p> : null}
        </div>
      </div>

      {hasFooter ? (
        <div className="flex flex-col gap-2 border-t border-border/50 px-4 py-3">
          {action ? (
            <button
              type="button"
              onClick={() => {
                action.onClick();
                dismiss();
              }}
              className={styles.action}
            >
              {action.label}
            </button>
          ) : null}
          {link ? (
            <Link
              href={link.href}
              onClick={dismiss}
              className={styles.link}
            >
              {link.label}
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

type ToastOptions = {
  description?: React.ReactNode;
  duration?: number;
  action?: { label: string; onClick: () => void };
  link?: { label: string; href: string };
  id?: string | number;
  [key: string]: unknown;
};

const loadingToastOptions = (options: ToastOptions = {}): ExternalToast => {
  const {
    description: _description,
    action: _action,
    link: _link,
    ...toastOptions
  } = options;
  return {
    ...toastOptions,
    duration: Infinity,
  };
};

/** Props handled inside CustomSonner — must not be forwarded to Sonner (avoids duplicate UI). */
const getSonnerPassthroughOptions = (options: ToastOptions = {}): ExternalToast => {
  const {
    description: _description,
    action: _action,
    link: _link,
    ...toastOptions
  } = options;
  return {
    ...toastOptions,
    unstyled: true,
    // Keep Sonner wrapper invisible + clipped so its square box doesn't peek past rounded-xl
    className:
      "!m-0 !border-none !bg-transparent !p-0 !shadow-none !outline-none !ring-0 rounded-xl overflow-hidden",
  };
};

function showCustomToast(
  type: string,
  message: React.ReactNode,
  options: ToastOptions = {},
) {
  return toast.custom(
    (t) => (
      <CustomSonner
        message={message}
        type={type}
        description={options.description}
        action={options.action}
        link={options.link}
        toastId={t}
      />
    ),
    getSonnerPassthroughOptions(options),
  );
}

export const CustomToast = {
  default: (message: React.ReactNode, options: ToastOptions = {}) =>
    showCustomToast("default", message, options),
  success: (message: React.ReactNode, options: ToastOptions = {}) =>
    showCustomToast("success", message, options),
  error: (message: React.ReactNode, options: ToastOptions = {}) =>
    showCustomToast("error", message, options),
  info: (message: React.ReactNode, options: ToastOptions = {}) =>
    showCustomToast("info", message, options),
  warning: (message: React.ReactNode, options: ToastOptions = {}) =>
    showCustomToast("warning", message, options),
  neutral: (message: React.ReactNode, options: ToastOptions = {}) =>
    showCustomToast("neutral", message, options),
  loading: (message: React.ReactNode, options: ToastOptions = {}) =>
    toast.loading(message, loadingToastOptions(options)),
  dismiss: (toastId?: string | number) => toast.dismiss(toastId),
};

export const CustomToaster = () => <Toaster />;

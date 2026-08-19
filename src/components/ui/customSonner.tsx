import React, { ReactNode } from "react";
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
}

type ToastStyle = {
  container: string;
  icon: string;
  title: string;
  description: string;
  action: string;
};

function getToastStyle(type: string): ToastStyle {
  const base = {
    container:
      "border border-border/50 bg-background/95 text-foreground shadow-2xl backdrop-blur-xl",
    title: "text-sm font-semibold leading-snug",
    description: "mt-1 text-xs leading-relaxed text-muted-foreground",
    action:
      "w-full rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90",
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

const CustomSonner = ({ message, type, description, action }: CustomSonnerProps) => {
  const styles = getToastStyle(type);
  const icon = getIcon(type);
  const hasFooter = Boolean(action);

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
        <div className="border-t border-border/50 px-4 py-3">
          {action ? (
            <button type="button" onClick={action.onClick} className={styles.action}>
              {action.label}
            </button>
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
  id?: string | number;
  [key: string]: unknown;
};

const loadingToastOptions = (options: ToastOptions = {}): ExternalToast => {
  const { description: _description, action: _action, ...toastOptions } = options;
  return {
    ...toastOptions,
    duration: Infinity,
  };
};

/** Props handled inside CustomSonner — must not be forwarded to Sonner (avoids duplicate UI). */
const getSonnerPassthroughOptions = (options: ToastOptions = {}): ExternalToast => {
  const { description: _description, action: _action, ...toastOptions } = options;
  return {
    ...toastOptions,
    unstyled: true,
  };
};

export const CustomToast = {
  default: (message: React.ReactNode, options: ToastOptions = {}) =>
    toast.custom(
      () => <CustomSonner message={message} type="default" {...options} />,
      getSonnerPassthroughOptions(options),
    ),
  success: (message: React.ReactNode, options: ToastOptions = {}) =>
    toast.custom(
      () => <CustomSonner message={message} type="success" {...options} />,
      getSonnerPassthroughOptions(options),
    ),
  error: (message: React.ReactNode, options: ToastOptions = {}) =>
    toast.custom(
      () => <CustomSonner message={message} type="error" {...options} />,
      getSonnerPassthroughOptions(options),
    ),
  info: (message: React.ReactNode, options: ToastOptions = {}) =>
    toast.custom(
      () => <CustomSonner message={message} type="info" {...options} />,
      getSonnerPassthroughOptions(options),
    ),
  warning: (message: React.ReactNode, options: ToastOptions = {}) =>
    toast.custom(
      () => <CustomSonner message={message} type="warning" {...options} />,
      getSonnerPassthroughOptions(options),
    ),
  neutral: (message: React.ReactNode, options: ToastOptions = {}) =>
    toast.custom(
      () => <CustomSonner message={message} type="neutral" {...options} />,
      getSonnerPassthroughOptions(options),
    ),
  loading: (message: React.ReactNode, options: ToastOptions = {}) =>
    toast.loading(message, loadingToastOptions(options)),
  dismiss: (toastId?: string | number) => toast.dismiss(toastId),
};

export const CustomToaster = () => <Toaster />;

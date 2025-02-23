import React, { ReactNode } from "react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaExclamationCircle,
  FaInfoCircle,
} from "react-icons/fa";
import { twMerge } from "tailwind-merge";

const CustomSonner = ({ message, type, description, action }) => {
  let className: string | undefined =
    "p-4 rounded shadow-lg text-sm max-w-[23rem]";
  let icon: ReactNode = null;

  switch (type) {
    case "success":
      className += " bg-green-500 text-black-500";
      icon = <FaCheckCircle />;
      break;
    case "error":
      className += " bg-red-500 text-[#fff]";
      icon = <FaExclamationCircle />;
      break;
    case "info":
      className += " bg-blue-500 text-[#fff]";
      icon = <FaInfoCircle />;
      break;
    case "warning":
      className += " bg-yellow-500 text-black-500";
      icon = <FaExclamationTriangle />;
      break;
    default:
      className += " bg-[#fff] text-black-500";
  }

  return (
    <div className={twMerge(className)}>
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center font-[500]">
          {icon && <span className="me-1 w-6">{icon}</span>}

          {message}
        </div>

        <div className="ms-[2rem] font-semibold">
          {action && (
            <button
              onClick={action.onClick}
              className="bg-[#fff] text-black-500 px-2 rounded min-w-[4rem]"
            >
              {action.label}
            </button>
          )}
        </div>
      </div>

      <div className="my-3 flex items-center justify-start w-full">
        {description && (
          <div
            className={
              type === "default"
                ? "text-sm text-gray-500 font-[400]"
                : "text-sm text-white-200 font-[400]"
            }
          >
            {description}
          </div>
        )}
      </div>
    </div>
  );
};

export const CustomToast = {
  default: (message, options) =>
    toast.custom(
      () => <CustomSonner message={message} type="default" {...options} />,
      options
    ),
  success: (message, options) =>
    toast.custom(
      () => <CustomSonner message={message} type="success" {...options} />,
      options
    ),
  error: (message, options) =>
    toast.custom(
      () => <CustomSonner message={message} type="error" {...options} />,
      options
    ),
  info: (message, options) =>
    toast.custom(
      () => <CustomSonner message={message} type="info" {...options} />,
      options
    ),
  warning: (message, options) =>
    toast.custom(
      () => <CustomSonner message={message} type="warning" {...options} />,
      options
    ),
};

export const CustomToaster = () => <Toaster />;

import { HTMLAttributes } from "react";
import { CgSpinner } from "react-icons/cg";
import { twMerge } from "tailwind-merge";

interface LoadingProps extends HTMLAttributes<HTMLDivElement> {
  text?: string;
  showText?: boolean;
}

export const LoadingComponent = ({
  text = "Carregando Informações...",
  showText = false,
  ...rest
}: LoadingProps) => {
  return (
    <div className="flex flex-wrap h-full w-full items-center justify-center overflow-hidden gap-2">
      {showText && <p>{text}</p>}
      <CgSpinner className={twMerge("animate-spin h-8 w-8", rest.className)} />
    </div>
  );
};

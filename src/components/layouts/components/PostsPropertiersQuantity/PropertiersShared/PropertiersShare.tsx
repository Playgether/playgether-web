"use client";

import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { ButtonHTMLAttributes } from "react";
import { twJoin, twMerge } from "tailwind-merge";

interface PropertiersShareProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Esta propriedade recebe a quantidade de commentários de um determinado post (ou qualquer outra coisa que esteja referenciado como um comentário por exemplo) */
  quantity_reposts: number;
  /** Como o nome já sugere, esta propriedade recebe a estilização do ícone do Comentário */
  iconClassName?: string;
  onClickShare: () => void;
}

/** Este componente é responsável por gerar o ícone de comentário e suas propriedades, ele faz parte de um padrão aplicado a esta aplicação chamado "Composite",
 * o intuito deste padrão é dar a liberdade de ser inserido qualquer tipo de propriedade de forma independente, juntas, ou combinadas, por exemplo: Apenas comentários, ou apenas
 * likes, ou comentários e likes, ou comentários, likes, e reposts etc...
 */
const PropertiersShare = ({
  quantity_reposts,
  iconClassName,
  onClickShare,
  ...rest
}: PropertiersShareProps) => {
  function formatNumber(number: number) {
    if (number >= 1000000) {
      const formatted = (Math.floor(number / 100000) / 10)
        .toFixed(1)
        .replace(".", ",");
      return formatted.endsWith(",0")
        ? formatted.slice(0, -2) + "mi"
        : formatted + "mi";
    } else if (number >= 1000) {
      const formatted = (Math.floor(number / 100) / 10)
        .toFixed(1)
        .replace(".", ",");
      return formatted.endsWith(",0")
        ? formatted.slice(0, -2) + "mil"
        : formatted + "mil";
    } else {
      return number;
    }
  }

  const onClickButton = (e) => {
    e.stopPropagation();
    e.preventDefault();
    onClickShare();
  };
  return (
    <Button
      variant="ghost"
      size="sm"
      className={twJoin(
        "text-muted-foreground hover:text-primary p-2",
        rest.className
      )}
      onClick={(event) => onClickButton(event)}
    >
      <Share2 className={twMerge("w-5 h-5 mr-2", iconClassName)} />
      {formatNumber(quantity_reposts)}
    </Button>
  );
};

export default PropertiersShare;

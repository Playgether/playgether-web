"use client";

import { AiOutlineRetweet } from "react-icons/ai";
import { twJoin } from "tailwind-merge";

interface PropertiersShareProps {
  /** Esta propriedade recebe a quantidade de commentários de um determinado post (ou qualquer outra coisa que esteja referenciado como um comentário por exemplo) */
  quantity_reposts: number;
  /** Como o nome já sugere, esta propriedade recebe a estilização do ícone do Comentário */
  iconClassName?: string;
}

/** Este componente é responsável por gerar o ícone de comentário e suas propriedades, ele faz parte de um padrão aplicado a esta aplicação chamado "Composite",
 * o intuito deste padrão é dar a liberdade de ser inserido qualquer tipo de propriedade de forma independente, juntas, ou combinadas, por exemplo: Apenas comentários, ou apenas
 * likes, ou comentários e likes, ou comentários, likes, e reposts etc...
 */
const PropertiersShare = ({
  quantity_reposts,
  iconClassName,
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

  return (
    <div className="flex flex-row justify-center items-center space-x-2 PropertiersShare-wrapper">
      <AiOutlineRetweet className={twJoin(iconClassName)} />
      <p className="PropertiersShare-number">
        {formatNumber(quantity_reposts)}
      </p>
    </div>
  );
};

export default PropertiersShare;

import { FaComment } from "react-icons/fa"
import { twJoin } from "tailwind-merge"

interface PropertiersCommentProps {
    /** Esta propriedade recebe a quantidade de reposts de um determinado post (ou qualquer outra coisa que esteja referenciado como um comentário por exemplo) */
    quantity_comment: number,
    /** Como o nome já sugere, esta propriedade recebe a estilização do ícone do Repost */
    iconClassName?: string
}


/** Este componente é responsável por gerar o ícone de repost e suas propriedades, ele faz parte de um padrão aplicado a esta aplicação chamado "Composite",
 * o intuito deste padrão é dar a liberdade de ser inserido qualquer tipo de propriedade de forma independente, juntas, ou combinadas, por exemplo: Apenas comentários, ou apenas
 * likes, ou comentários e likes, ou comentários, likes, e reposts etc...
 */
const PropertiersComment = ({quantity_comment, iconClassName}: PropertiersCommentProps) => {

    function formatNumber(number:number) {
        if (number >= 1000000) {
          const formatted = (Math.floor(number / 100000) / 10).toFixed(1).replace('.', ',');
          return formatted.endsWith(',0') ? formatted.slice(0, -2) + 'mi' : formatted + 'mi';
        } else if (number >= 1000) {
          const formatted = (Math.floor(number / 100) / 10).toFixed(1).replace('.', ',');
          return formatted.endsWith(',0') ? formatted.slice(0, -2) + 'mil' : formatted + 'mil';
        } else {
          return number;
        }
    }

    return (
        <div className="flex flex-row justify-center items-center space-x-2">
            <FaComment className={twJoin(iconClassName)} />
            <p className="text-black-200">{formatNumber(quantity_comment)}</p>
        </div>
    )
}

export default PropertiersComment
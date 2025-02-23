"use client";

import { PiHeartFill, PiHeartThin } from "react-icons/pi";
import { twJoin } from "tailwind-merge";
import { useState } from "react";
import {} from "../../../../../context/AuthContext";
import { postLike } from "../../../../../services/postLike";
import { deleteLike } from "../../../../../services/deleteLike";

export interface PropertiersLikeProps {
  /** Esta propriedade recebe a quantidade de likes de um determinado post (ou qualquer outra coisa que esteja referenciado como um comentário por exemplo)*/
  quantity_likes: number;
  /** Como o nome já sugere, esta propriedade recebe a estilização do ícone do Like */
  iconClassName?: string;
  /** Também como o nome já pré sugere, esta prop é um boolean que recebe True, caso o usuário logado já tenha curtido esse post, ou False caso não tenha(virá do backend), seu
   * intuito é controlar qual ícone irá aparecer e suas animações
   */
  user_already_like: boolean;
  /** Esta propriedade recebe qual tipo de conteúdo está sendo inserido este like(Um post, comentário, repost, profile, etc..), você pode pegar a chave de cada conteúdo
   * dentro do enum "LikeContentType" dentro do módulo "content-type". É importante que venha desse enum para que todas as chaves sejam corretas e que o Like funcione no
   * backend, além disso, ele define exatamente quais coisas podem ser curtidas na aplicação. Este enum também garante que todas inserções tenham uma mesma origem, para caso
   * alguma das chaves mudem, a manutenção no front seja simples e fácil de fazer.
   */
  content_type: string;
  /** Esta propriedade recebe o id do objeto que esta recebendo o like (id do post, comentário, repost ou profile) */
  object_id: number;
}
/** Este componente é responsável por gerar o ícone de Like e suas propriedades, ele faz parte de um padrão aplicado a esta aplicação chamado "Composite",
 * o intuito deste padrão é dar a liberdade de ser inserido qualquer tipo de propriedade de forma independente, juntas, ou combinadas, por exemplo: Apenas likes, ou apenas
 * comentários, ou comentários e likes, ou comentários, likes, e reposts etc...
 */
const PropertiersLike = ({
  quantity_likes,
  iconClassName,
  user_already_like,
  content_type,
  object_id,
}: PropertiersLikeProps) => {
  const [onClicked, setOnClicked] = useState(user_already_like);
  const [quantitylikesNumber, setQuantityLikesNumber] =
    useState(quantity_likes);
  const [effectThin, setEffectThin] = useState(false);
  const [effectFill, setEffectFill] = useState(false);
  // const { user, authTokens } = ();

  const onClickLike = () => {
    const data = {
      user: user?.user_id,
      content_type: content_type,
      object_id: object_id,
    };
    setOnClicked(true);
    postLike(data, authTokens);
  };

  const onClickDeleteLike = () => {
    setOnClicked(false);
    deleteLike(authTokens, object_id);
  };

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
    <div className="flex flex-row justify-center items-center space-x-2">
      {onClicked === true ? (
        <PiHeartFill
          className={twJoin(
            "cursor-pointer PropertiersLike-wrapper-thin",
            iconClassName,
            effectFill === true ? "animate-like" : ""
          )}
          onClick={() => {
            setQuantityLikesNumber(quantitylikesNumber - 1);
            setOnClicked(!onClicked);
            setEffectThin(true);
            onClickDeleteLike();
          }}
        />
      ) : (
        <PiHeartThin
          className={twJoin(
            "cursor-pointer PropertiersLike-wrapper-fill",
            iconClassName,
            effectThin === true ? "animate-deleteLike" : ""
          )}
          onClick={() => {
            setQuantityLikesNumber(quantitylikesNumber + 1);
            setEffectFill(true);
            onClickLike();
          }}
        />
      )}
      <p className="PropertiersLike-number">
        {formatNumber(quantitylikesNumber)}
      </p>
    </div>
  );
};

export default PropertiersLike;

import Link from "next/link";
import { HTMLAttributes } from "react";
import { twJoin } from "tailwind-merge";

interface UserNameProps extends HTMLAttributes<HTMLDivElement> {
  /** Está variavel deve receber o nome de usuário. */
  username: string;
}

/** Este componente é responsável por gerar nomes de usuários onde seja necessário. Ele recebe uma string que deve ser o username, e devolve ela em uma div estilizada.
 * Ele também pode receber estilos através do twJoin
 */
const UserNamePost = ({ username, ...rest }: UserNameProps) => {
  return (
    <div className={twJoin("", rest.className)} {...rest}>
      <h1 className="UserNamePost-wrapper text-sm lg:text-md mt-3">
        <Link href={`/profile/${username}`}>{username}</Link>
      </h1>
    </div>
  );
};

export default UserNamePost;

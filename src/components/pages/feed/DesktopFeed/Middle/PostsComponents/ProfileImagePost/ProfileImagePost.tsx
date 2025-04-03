import { CgProfile } from "react-icons/cg";
import Image from "next/legacy/image";
import { twJoin } from "tailwind-merge";
import { HTMLAttributes } from "react";
import Link from "next/link";

interface DivProps extends HTMLAttributes<HTMLDivElement> {}

export type Resource = {
  /** Esta propriedade recebe uma string, que deve ser a url da foto de perfil. */
  link_photo?: string;
  /** Esta propriedade recebe o username (string) para ser criado um link para seu perfil */
  username: string;
};

/**
 * Este componente serve para mostrar a foto de perfil do autor de algum post
 * OBS: Você precisa passar um className definindo a altura (height) e a largura (width) do container, visto que a imagem possui a propriedade "fill". Caso não passe, a imagem não aparecerá na tela.
 * Outra OBS: Tenha certeza de que o link da imagem que está sendo enviada possui o base URL configurado nas URLs de imagens do Next.js.
 */
const ProfileImagePost = ({
  link_photo,
  username,
  ...rest
}: Resource & DivProps) => {
  return (
    <div
      className={twJoin(
        " ProfilePhotoLink-wrapper rounded-full",
        rest.className
      )}
    >
      {typeof link_photo !== "string" || link_photo === "" ? (
        <Link
          href={`/profile/${username}`}
          className="h-full w-full underline "
        >
          <CgProfile className="h-full w-full" />
        </Link>
      ) : (
        <Link href={`/profile/${username}`} className="h-full w-full underline">
          <Image
            src={link_photo}
            objectFit="cover"
            width={400}
            height={400}
            alt="Imagem de perfil do card profile do feed"
            className="rounded-full"
          />
        </Link>
      )}
    </div>
  );
};

export default ProfileImagePost;

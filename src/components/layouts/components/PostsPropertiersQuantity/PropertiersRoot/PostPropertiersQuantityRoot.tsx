import { HTMLAttributes, ReactNode } from "react";
import { twMerge } from "tailwind-merge";

export interface PostPropertiersQuantityRootInterface
  extends HTMLAttributes<HTMLDivElement> {
  /** Esta prop recebe o "children", que seria basicamente um ou mais componentes PostPropertiers (PropertiersLike,
   * PropertiersComment, etc ...) */
  children: ReactNode;
}

/** Este é o componente wrapper dos componentes PostPropertiers do padrão composite, seu intuito é ser o container raiz destes componentes.
 * OBS: Este wrapper tem algumas propriedades de estilo padrões, porém, você pode adicionar mais estilizações através do className
 */
const PostPropertiersQuantityRoot = ({
  children,
  ...rest
}: PostPropertiersQuantityRootInterface) => {
  return (
    <div className="flex items-center justify-between">
      <div className={twMerge("flex items-center space-x-6", rest.className)}>
        {children}
      </div>
    </div>
  );
};

export default PostPropertiersQuantityRoot;

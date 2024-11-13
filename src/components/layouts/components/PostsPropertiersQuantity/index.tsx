import PostPropertiersQuantityRoot from "./PropertiersRoot/PostPropertiersQuantityRoot"
import PropertiersComment from "./PropertiersComment/PropertiersComment"
import PropertiersLike from "./PropertiersLike/PropertiersLike"
import PropertiersShare from "./PropertiersShared/PropertiersShare"

/** Esta é uma constante que reexporta os tipos de Propriedades possíveis, por ser um objeto, nos podemos acessar suas propriedades e através disto nós conseguimos criar o 
 * padrão composite (executando "PostPropertiers.Like" por exemplo).
 * PS: Este componente não retorna nada visualmente, sua função é apenas reexporta os tipos de Propriedades de posts, esses sim por sua vez, restornam.
 */
export const PostPropertiers = {
    Root: PostPropertiersQuantityRoot,
    Like: PropertiersLike,
    Comment: PropertiersComment,
    Share: PropertiersShare
}
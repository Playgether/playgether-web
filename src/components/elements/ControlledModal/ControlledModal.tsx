import { ReactNode } from "react";

export type ModalProps = {
  /** Esta prop recebe uma função que determina o que deve acontecer quando o background do modal for clicado(geralmente, o Modal deve fechar, esta prop vai vir
   * do ControlledModal, que por sua vez vai receber esta prop pelo componente que o esta utilizando. ). */
  onClick: () => void;
  /** Esta prop recebe o children do ModalBackground, que neste caso, será o componente "ModalBody" */
  children: ReactNode;
};

/** O ModalBackground é a parte "de fora" do modal, ele serve para controlar os eventos de clique fora do modal, além do background do proprio modal */
export const ModalBackground = ({ onClick, children }: ModalProps) => {
  const handleClick = (e: MouseEvent) => {
    onClick();
  };

  return (
    <div className="w-full h-2/6" onClick={() => handleClick}>
      {children}
    </div>
  );
};

/** O ModalBody é a parte de dentro do modal, ele é o wrapper principal do modal, ou seja, o modal em sí */
export const ModalBody = ({ children }: ModalProps) => {
  const handleClick = (e: MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      className="m-auto h-full w-full overflow-y-auto"
      onClick={() => handleClick}
    >
      {children}
    </div>
  );
};

interface ControlledModalProps {
  /** Este componente recebe a propriedade children do ReactNode, ou seja, ele serve como um wrapper para o conteúdo do modal, esta children é o conteúdo do Modal propriamente
   * dito.
   */
  children: ReactNode;
  /** Esta prop recebe um valor boleano que determina quando o modal deveria aparecer, ou não, quando ela for "true", o modal aparecerá, quando ela for "false" o modal
   * desaparecerá.
   */
  shouldShow: boolean;
  /** Esta prop recebe uma função que determina o que deve ser feito quando o modal for fechado, ela é acionada no momento em que o usuário clica no "X" do modal, geralmente
   * ela deve ser utilizada passando uma função que seta um "false" na const que controla a propriedade de cima "shouldShow"
   */
  onRequestClose: () => void;
}

/** Este componente é responsável por criar um ContolledModal baseado no padrão Controlled Components do react. Este modal tem o propósito de ser completamente personalizável
 * podendo ser criado pra qualquer cenários em que se precise de um Modal. Portanto, caso precise de algum Modal, este componente pode ser usado.
 * Um exemplo de onde este modal esta sendo usado é no componente "EditComponent", quando um usuário clica no ícone de "delete" do comentário, um modal aparece pergutando se
 * ele tem certeza que deseja realizar esta ação, este model utiliza este componente.
 */
const ControlledModal = ({
  shouldShow,
  onRequestClose,
  children,
}: ControlledModalProps) => {
  return (
    <>
      {shouldShow ? (
        <ModalBackground onClick={onRequestClose}>
          <ModalBody onClick={() => shouldShow}>{children}</ModalBody>
        </ModalBackground>
      ) : null}
    </>
  );
};

export default ControlledModal;

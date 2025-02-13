import React from "react";
import LogoName from "./LogoName";
import DefaultButton from "../../elements/DefaultButton/DefaultButton";

interface NormalProps {
  onClickCadastrar: () => void;
  onClickLogar: () => void;
}

const Normal = ({ onClickCadastrar, onClickLogar }: NormalProps) => {
  return (
    <div className="text-white-200 text-center flex flex-col items-center justify-center w-screen gap-6">
      <div className="h-full w-80 sm:w-4/6 md:w-5/6 lg:w-4/6 xl:w-3/6 2xl:w-3/6 relative">
        <LogoName />
      </div>
      <div className="space-x-10 w-screen flex items-center justify-center">
        <div className="">
          <DefaultButton
            onClick={onClickCadastrar}
            className="text-md py-4 px-6"
          >
            CADASTRAR
          </DefaultButton>
        </div>
        <DefaultButton onClick={onClickLogar} className="text-md py-4 px-6">
          LOGAR
        </DefaultButton>
      </div>
    </div>
  );
};

export default Normal;

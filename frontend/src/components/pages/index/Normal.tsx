import React from "react";
import LogoName from "./LogoName";
import Button from "../../elements/Button";

const Normal = ({onclickCadastrar, onClickLogar}) => {
    return (
        <div className="text-white-200 text-center flex flex-col items-center justify-center w-screen gap-6">
        <div className='h-full w-80 sm:w-4/6 md:w-5/6 lg:w-4/6 xl:w-3/6 2xl:w-3/6 relative'>
            <LogoName/>
        </div>
        <div className="space-x-10 w-screen flex items-center justify-center">
            <div className=''>
                <Button
                onClick={onclickCadastrar}
                pxValue={4}
                pyValue={4}
                extraClassName={null}
                >
                CADASTRAR
                </Button>
            </div>
            <Button
            onClick={onClickLogar}
            pxValue={8}
            pyValue={4}
            extraClassName={null}
            >
            LOGAR
            </Button>
        </div>
    </div>
    );
};

export default Normal
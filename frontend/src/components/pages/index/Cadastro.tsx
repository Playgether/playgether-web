import React from "react";
import Image from "next/image";
import Button from "../../elements/Button";
import ButtonClose from "../../elements/ButtonClose";
import ImageComponent from "../../elements/ImageComponent";
import FormCadastro from "./FormCadastro";

const Cadastro = ({onClickX, onClickAqui}) => {
    return (
        <div className='h-screen lg:h-screen flex flex-col justify-center bg-blue-400 bg-opacity-30 absolute w-screen'>
        <div className='bg-white-200 mx-auto max-w-md py-8 px-10 shadow rounded-lg overflow-auto'>
            <div className='mb-4 flex flex-col justify-between text-center'>
                <ButtonClose onClick={onClickX}>X</ButtonClose>
                <ImageComponent src={"/index/logoWhiteBackground.png"} width={400} height={400} alt={"Logo com Background"}/>
            </div>
            <FormCadastro onClickAqui={onClickAqui} action={null}/>
        </div>
    </div>
    );
};

export default Cadastro
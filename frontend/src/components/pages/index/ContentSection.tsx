'use client'

import React from "react";
import Sobre from "./Sobre";
import Cadastro from "./Cadastro";
import Login from "./Login";
import Normal from "./Normal";
import useActiveButton from './Function';
import HeaderIndex from "./HeaderIndex";

const ContentSection = () => {
    const { getActiveButton, handleButtonClick } = useActiveButton();
    return (
        <>
           <HeaderIndex onClickLogo={() => handleButtonClick('normal')} onClickSobre={() => handleButtonClick('sobre')}/>
           {getActiveButton() === 'sobre' && (

                <Sobre onClickVoltar={() => handleButtonClick('normal')}/>
            )}  
            {getActiveButton() === 'normal' && (

                <Normal onClickLogar={() => handleButtonClick('login')} onclickCadastrar={() => handleButtonClick ('cadastro')} />
            )}

            {getActiveButton() === 'cadastro' && (

                <Cadastro onClickX={() => handleButtonClick('normal')} onClickAqui={() => handleButtonClick('login')}/>

            )}

            {getActiveButton() === 'login' && (

                <Login onClickX={() => handleButtonClick('normal')} onClickAqui={() => handleButtonClick('cadastro')}/>

            )}
        </>
    );
};

export default ContentSection
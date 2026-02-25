'use client'

import React from "react";
import Sobre from "./Sobre";
import Cadastro from "./Cadastro";
import Login from "./Login";
import Normal from "./Normal";
import useActiveButton from './UseActiveButton';
import HeaderIndex from "./HeaderIndex";
import Footer from "./Footer";

const ContentSection = () => {
    const { getActiveButton, handleButtonClick } = useActiveButton();
    const active = getActiveButton();
    return (
        <div className="relative z-10 min-h-screen">
          <HeaderIndex
            onClickLogo={() => handleButtonClick("normal")}
            onClickSobre={() => handleButtonClick("sobre")}
          />

          <Normal
            onClickLogar={() => handleButtonClick("login")}
            onClickCadastrar={() => handleButtonClick("cadastro")}
          />

          <Footer />

          {active === "sobre" && (
            <Sobre onClickVoltar={() => handleButtonClick("normal")} />
          )}

          {active === "cadastro" && (
            <Cadastro
              onClickX={() => handleButtonClick("normal")}
              onClickAqui={() => handleButtonClick("login")}
            />
          )}

          {active === "login" && (
            <Login
              onClickX={() => handleButtonClick("normal")}
              onClickAqui={() => handleButtonClick("cadastro")}
            />
          )}
        </div>
    );
};

export default ContentSection
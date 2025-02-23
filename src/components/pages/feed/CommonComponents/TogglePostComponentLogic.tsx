"use client";
import { useState } from "react";
import { IoArrowDownCircleSharp, IoArrowUpCircle } from "react-icons/io5";

const TogglePostComponentLogic = () => {
  const [isComponentVisible, setComponentVisible] = useState(false);

  const toggleComponentVisibility = () => {
    setComponentVisible(!isComponentVisible);
  };
  return (
    <>
      <h1>{isComponentVisible ? "Fechar" : "Compartilhe algo conosco"}</h1>
      <button className="" onClick={toggleComponentVisibility}>
        {isComponentVisible ? (
          <IoArrowUpCircle className="pt-1 h-8 w-8 animate-bounce" />
        ) : (
          <IoArrowDownCircleSharp className="pt-1 animate-bounce h-8 w-8" />
        )}
      </button>
    </>
  );
};

export default TogglePostComponentLogic;

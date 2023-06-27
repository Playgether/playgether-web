import React from "react";
import { useState } from 'react';

const useActiveButton = () => {
    const [activeButton, setActiveButton] = useState('normal');
  
    const handleButtonClick = (buttonName) => {
      setActiveButton(buttonName);
    };

    const getActiveButton = () =>{
      return activeButton
    }

    return { getActiveButton, handleButtonClick };
  };
  
export default useActiveButton;
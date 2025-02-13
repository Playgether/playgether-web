"use client";

import React, { useState } from "react";
import { ItemsHeader } from "./HeaderItems";
import { FiAlignJustify } from "react-icons/fi";

const IconsHeader = ({}) => {
  const [isMenuResponsiveShowing, setIsMenuResponsiveShowing] = useState(false);

  const handleMenuResponsive = () => {
    return setIsMenuResponsiveShowing(!isMenuResponsiveShowing);
  };

  return (
    <>
      <div
        className={`items-center justify-center IconsHeader-wrapper ${isMenuResponsiveShowing ? "absolute" : "close"}`}
      >
        <div className="h-full flex flex-col justify-center items-center IconsHeader-fa-align-icon">
          <FiAlignJustify
            className="h-7 w-7 lg:hidden"
            onClick={() => handleMenuResponsive()}
          />
          <div
            className={`w-full ${isMenuResponsiveShowing ? null : "hidden"} lg:flex`}
          >
            <ItemsHeader />
          </div>
        </div>
      </div>
    </>
  );
};

export default IconsHeader;

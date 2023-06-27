import React from "react";

const Button = ({children, onClick, pxValue = 4, pyValue = 4, extraClassName}) => {

    return (
        <button className={`bg-orange-500 px-${pxValue} py-${pyValue} 2xl:px-8 2xl:py-4 rounded text-white-200 shadow hover:bg-orange-700 text-xl text-center ${extraClassName}`} onClick={onClick}>
            {children}          
        </button>
    );
};

export default Button;

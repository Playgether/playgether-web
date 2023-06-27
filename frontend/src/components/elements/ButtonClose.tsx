import React from "react";

const ButtonClose = ({children, onClick, pyValue = 4, pxValue = 4, width = 0, height = 0}) => {
    return(

        <button className={`bg-red-500 px-${pxValue} py-${pyValue} rounded text-white-200 shadow hover:bg-red-700 text-xl text-center flex justify-center items-center w-${width} h-${height}`} onClick={onClick}>
            {children}
        </button>

    );
};

export default ButtonClose
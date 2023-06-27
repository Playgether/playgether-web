import React from "react";
import ImageComponent from "../../elements/ImageComponent";

const Header = ({onClickLogo, onClickSobre}) => {
    return (
        <header className="flex justify-between w-screen pl-8 pr-16 items-center">
            <div className='w-28 sm:w-32 md:w-40 lg:w-32 xl:w-48 2xl:w-56'>
                <a href = "#" onClick={onClickLogo}>
                    <ImageComponent src={"/index/logo.png"} width={0} height={0} layout={"responsive"} alt={"logo"} />
                </a>
            </div>
            <div>
                <a href = '#' onClick={onClickSobre} className="text-2xl 2xl:text-4xl text-orange-400">SOBRE</a>
            </div>
        </header>
    );
};

export default Header;
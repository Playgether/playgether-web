import React from "react";
import ButtonClose from "../../elements/ButtonClose";
import FormLogin from "./FormLogin";
import Image from "next/legacy/image";


const Login = ({onClickX, onClickAqui}) => {
    return (
        <div className='h-screen flex flex-col justify-center bg-blue-400 bg-opacity-30 absolute w-screen'>
            <div className='bg-white-200 mx-auto max-w-md py-8 px-10 shadow rounded-lg overflow-auto'>
                <div className='mb-4 flex flex-col justify-between text-center'>
                <ButtonClose onClick={onClickX}>X</ButtonClose>
                <Image src={"/index/logoWhiteBackground.png"} width={400} height={400} alt={"Logo com Background"}/>
                </div>
                <FormLogin onClickAqui={onClickAqui}/>
            </div>
    </div>

    );
};

export default Login;
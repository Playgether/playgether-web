import React from "react";
import { PiHeartFill } from "react-icons/pi";
import { FaComment } from "react-icons/fa";
import { AiOutlineRetweet } from "react-icons/ai";
import Image from "next/legacy/image";
import TextLimitComponent from "../../layouts/TextLimitComponent";
import { IoArrowDownCircleSharp, IoArrowUpCircle } from "react-icons/io5";

const FeedComponent = ({}) => {
    return (
        <>
        <div className="h-5/6 shadow-lg flex flex-col space-y-6 w-full bg-white-200 mb-5 ">
            <div className="flex flex-row">
                <div className="rounded-full h-16 w-16 flex items-center justify-center relative mt-3 ml-3 bg-red-200">
                    <h1 className="text-sm">pic</h1>
                </div>
                <div className="text-center mt-5 ml-3">
                    <h1 className="text-orange-500">Mia Jensen</h1>
                    <p className="text-black-200 opacity-30 text-sm">2 hours ago</p>
                </div>
            </div>
            <div className="w-full text-left pl-6 pr-6 text-black-300 break-all lg:text-sm">
                <p><TextLimitComponent text="Quinto campeonato de disputa de clãs eu quero saber eu quero testar comoissoquebraesequebralegalestacaralha dsadsadsadasdsadsadasdsad sdkapodksaopkdsoakdopsakdopsakodpskaopdksaopkdsaopkdopsakdopsak" maxCharacters={160}/></p>
            </div>
            <div className="relative h-full w-full flex flex-col items-center justify-center">
                <div className="w-5/6 h-full">
                    <Image
                        src={"/feed/p2.jpg"}
                        alt={"TESTE"}
                        layout="fill"
                        objectFit="contain"
                    />
                </div>
            </div>   
            <div className="border-b border-black-200 border-opacity-30 "></div>
                <div className="pl-3 pr-3 text-orange-500 flex-1 pb-6 flex flex-row justify-center items-center bg-white-200">
                    <div className="w-5/6 flex flex-row justify-between">
                        <div className="flex flex-row items-center justify-center space-x-2">
                            <PiHeartFill className="h-6 w-6" />
                            <p className="text-black-200">1.2k</p>
                        </div>
                        <div className="flex flex-row items-center justify-center space-x-2">
                            <FaComment className="h-6 w-6" />
                            <p className="text-black-200">342</p>
                        </div>
                        <div className="flex flex-row items-center justify-center space-x-2">
                            <AiOutlineRetweet className="h-6 w-6"/>
                            <p className="text-black-200">150</p>
                        </div>
                    </div>
                </div>
            </div>                                        


            <div className="h-2/6 shadow-lg flex flex-col space-y-6 w-full bg-white-200 mb-5 ">
            <div className="flex flex-row">
                <div className="rounded-full h-16 w-16 flex items-center justify-center relative mt-3 ml-3 bg-red-200">
                    <h1 className="text-sm">pic</h1>
                </div>
                <div className="text-center mt-5 ml-3">
                    <h1 className="text-orange-500">Mia Jensen</h1>
                    <p className="text-black-200 opacity-30 text-sm">2 hours ago</p>
                </div>
            </div>
            <div className="w-full text-left pl-6 pr-6 text-black-300 break-all lg:text-sm">
                <p><TextLimitComponent text="Quinto campeonato de disputa de clãs eu quero saber eu quero testar comoissoquebraesequebralegalestacaralha dsadsadsadasdsadsadasdsad sdkapodksaopkdsoakdopsakdopsakodpskaopdksaopkdsaopkdopsakdopsak" maxCharacters={160}/></p>
            </div> 
            <div className="border-b border-black-200 border-opacity-30 "></div>
                <div className="pl-3 pr-3 text-orange-500 flex-1 pb-6 flex flex-row justify-center items-center bg-white-200">
                    <div className="w-5/6 flex flex-row justify-between">
                        <div className="flex flex-row items-center justify-center space-x-2">
                            <PiHeartFill className="h-6 w-6" />
                            <p className="text-black-200">1.2k</p>
                        </div>
                        <div className="flex flex-row items-center justify-center space-x-2">
                            <FaComment className="h-6 w-6" />
                            <p className="text-black-200">342</p>
                        </div>
                        <div className="flex flex-row items-center justify-center space-x-2">
                            <AiOutlineRetweet className="h-6 w-6"/>
                            <p className="text-black-200">150</p>
                        </div>
                    </div>
                </div>
            </div>                                        


            <div className="h-4/6 shadow-lg flex flex-col space-y-6 w-full bg-white-200 mb-5 ">
            <div className="flex flex-row">
                <div className="rounded-full h-16 w-16 flex items-center justify-center relative mt-3 ml-3 bg-red-200">
                    <h1 className="text-sm">pic</h1>
                </div>
                <div className="text-center mt-5 ml-3">
                    <h1 className="text-orange-500">Mia Jensen</h1>
                    <p className="text-black-200 opacity-30 text-sm">2 hours ago</p>
                </div>
            </div>
            <div className="w-full text-left pl-6 pr-6 text-black-300 break-all lg:text-sm">
                <p><TextLimitComponent text="Quinto campeonato de disputa de clãs eu quero saber eu quero testar comoissoquebraesequebralegalestacaralha dsadsadsadasdsadsadasdsad sdkapodksaopkdsoakdopsakdopsakodpskaopdksaopkdsaopkdopsakdopsak" maxCharacters={160}/></p>
            </div>
            <div className="relative h-full w-full flex flex-col items-center justify-center">
                <div className="w-5/6 h-full">
                    <Image
                        src={"/feed/p2.jpg"}
                        alt={"TESTE"}
                        layout="fill"
                        objectFit="contain"
                    />
                </div>
            </div>   
            <div className="border-b border-black-200 border-opacity-30 "></div>
                <div className="pl-3 pr-3 text-orange-500 flex-1 pb-6 flex flex-row justify-center items-center bg-white-200">
                    <div className="w-5/6 flex flex-row justify-between">
                        <div className="flex flex-row items-center justify-center space-x-2">
                            <PiHeartFill className="h-6 w-6" />
                            <p className="text-black-200">1.2k</p>
                        </div>
                        <div className="flex flex-row items-center justify-center space-x-2">
                            <FaComment className="h-6 w-6" />
                            <p className="text-black-200">342</p>
                        </div>
                        <div className="flex flex-row items-center justify-center space-x-2">
                            <AiOutlineRetweet className="h-6 w-6"/>
                            <p className="text-black-200">150</p>
                        </div>
                    </div>
                </div>
            </div>                                        


            <div className="h-5/6 shadow-lg flex flex-col space-y-6 w-full bg-white-200 mb-5 ">
            <div className="flex flex-row">
                <div className="rounded-full h-16 w-16 flex items-center justify-center relative mt-3 ml-3 bg-red-200">
                    <h1 className="text-sm">pic</h1>
                </div>
                <div className="text-center mt-5 ml-3">
                    <h1 className="text-orange-500">Mia Jensen</h1>
                    <p className="text-black-200 opacity-30 text-sm">2 hours ago</p>
                </div>
            </div>
            <div className="w-full text-left pl-6 pr-6 text-black-300 break-all lg:text-sm">
                <p><TextLimitComponent text="Quinto campeonato de disputa de clãs eu quero saber eu quero testar comoissoquebraesequebralegalestacaralha dsadsadsadasdsadsadasdsad sdkapodksaopkdsoakdopsakdopsakodpskaopdksaopkdsaopkdopsakdopsak" maxCharacters={160}/></p>
            </div>
            <div className="relative h-full w-full flex flex-col items-center justify-center">
                <div className="w-5/6 h-full flex-1">
                    <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        controls
                        >
                        <source src="/index/background5.mp4" type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                </div>
            </div>   
            <div className="border-b border-black-200 border-opacity-30 "></div>
                <div className="pl-3 pr-3 text-orange-500 flex-1 pb-6 flex flex-row justify-center items-center bg-white-200">
                    <div className="w-5/6 flex flex-row justify-between">
                        <div className="flex flex-row items-center justify-center space-x-2">
                            <PiHeartFill className="h-6 w-6" />
                            <p className="text-black-200">1.2k</p>
                        </div>
                        <div className="flex flex-row items-center justify-center space-x-2">
                            <FaComment className="h-6 w-6" />
                            <p className="text-black-200">342</p>
                        </div>
                        <div className="flex flex-row items-center justify-center space-x-2">
                            <AiOutlineRetweet className="h-6 w-6"/>
                            <p className="text-black-200">150</p>
                        </div>
                    </div>
                </div>
            </div>                                        


          
            <div className="h-5/6 shadow-lg flex flex-col space-y-6 w-full bg-white-200">
                <div className="flex flex-row">
                    <div className="rounded-full h-16 w-16 flex items-center justify-center relative mt-3 ml-3 bg-red-200">
                        <h1 className="text-sm">pic</h1>
                    </div>
                    <div className="text-center mt-5 ml-3">
                        <h1 className="text-orange-500">Mia Jensen</h1>
                        <p className="text-black-200 opacity-30 text-sm">2 hours ago</p>
                    </div>
                </div>
                <div className="w-full text-left pl-6 pr-6 text-black-300 break-all lg:text-sm">
                    <p><TextLimitComponent text="Quinto campeonato de disputa de clãs eu quero saber eu quero testar comoissoquebraesequebralegalestacaralha dsadsadsadasdsadsadasdsad sdkapodksaopkdsoakdopsakdopsakodpskaopdksaopkdsaopkdopsakdopsak" maxCharacters={160}/></p>
                </div>
                <div className="relative h-full w-full flex flex-col items-center justify-center bg-white-200 bg-opacity-20 flex-grow">
                    <div className="w-5/6 h-full">
                        <Image
                            src={"/feed/p3.jpg"}
                            alt={"TESTE"}
                            layout="fill"
                            objectFit="contain"
                        />
                    </div>
                </div>   
                <div className="border-b border-black-200 border-opacity-30 "></div>
                    <div className="pl-3 pr-3 text-orange-500 flex-1 pb-6 flex flex-row justify-center items-center bg-white-200">
                        <div className="w-5/6 flex flex-row justify-between">
                            <div className="flex flex-row items-center justify-center space-x-2">
                                <PiHeartFill className="h-6 w-6" />
                                <p className="text-black-200">1.2k</p>
                            </div>
                            <div className="flex flex-row items-center justify-center space-x-2">
                                <FaComment className="h-6 w-6" />
                                <p className="text-black-200">342</p>
                            </div>
                            <div className="flex flex-row items-center justify-center space-x-2">
                                <AiOutlineRetweet className="h-6 w-6"/>
                                <p className="text-black-200">150</p>
                            </div>
                        </div>
                    </div>
                </div> 
                

                <div className=" relative h-24 w-full text-orange-500 flex flex-row items-center justify-center bg-white-400 flex-grow">
                    <h1>Carregar mais</h1>
                    <button><IoArrowDownCircleSharp className="h-8 w-8"/></button>
                </div>                         
        

            
            </>
    );
};

export default FeedComponent
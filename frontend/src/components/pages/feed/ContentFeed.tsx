'use client'
import React from "react";
import AsideFeed from "../../layouts/AsideBase";
import ProfileCard from "./ProfileCard";
import OnlineFriendsCard from "./OnlineFriendsCard";
import PostComponent from "./PostComponent";
import FeedComponent from "./FeedComponent";
import { useState, useEffect } from 'react';
import { IoArrowDownCircleSharp, IoArrowUpCircle } from "react-icons/io5";
import { getNotifications, getNotificationsProps } from "../../../services/getNotifications";
import { useAuthContext } from "../../../context/AuthContext";

const ContentFeed = () => {
    const [isComponentVisible, setComponentVisible] = useState(false);
    const [notifications, setNotifications] = useState<getNotificationsProps[]>([]);
  
    const { authTokens, user } = useAuthContext();
  
    const toggleComponentVisibility = () => {
      setComponentVisible(!isComponentVisible);
    };
  
    const handleNotifications = async () => {
        if (authTokens) {
            const response = await getNotifications(authTokens, user);
            setNotifications(response);
        }
    };
  
    useEffect(() => {
      handleNotifications();
    }, [authTokens, user]);
    
    return (
        <div className="flex-1 grid grid-cols-4 gap-2">
            <div>
                <div className="flex flex-row h-full pt-2 space-x-2">
                    <div className="bg-white-300 flex-1 h-5/6 flex flex-col space-y-4">
                        <ProfileCard />
                        <OnlineFriendsCard />
                    </div>
                </div>

            </div>
            <div className="bg-white-300 col-span-2 flex flex-col space-y-2">
                <div className="flex flex-row w-full space-x-3 items-center justify-center text-orange-500">
                    <div className="text-sm bg-white-300 w-full flex flex-row justify-center items-center space-x-2 pt-1">
                        <h1>{isComponentVisible ? "Fechar" : "Compartilhe algo conosco"}</h1>
                        <button className="" onClick={toggleComponentVisibility}>{isComponentVisible ? <IoArrowUpCircle className="h-8 w-8"/> : <IoArrowDownCircleSharp className="h-8 w-8"/>}</button>
                    </div>
                </div>
                {isComponentVisible && <PostComponent />}
                    <FeedComponent />

            </div>
            <div className="bg-white-300">
                <div className="bg-white-300 flex-1 h-5/6 flex flex-col space-y-4">
                    <div className="bg-white-200 h-3/6 flex mt-2 flex-col items-center space-y-2 rounded-lg shadow-lg overflow-y-auto">
                        <div>
                            <h1 className="font-medium text-black-200 text-center pt-2 border-b border-black-200 border-opacity-30 text-md">Notificações Recentes</h1>
                        </div>
                        <div className="flex flex-col w-full pl-2 flex-wrap divide-y-2 flex-grow justify-center 2xl:space-y-4">
                            <div className="flex items-center justify-start space-x-2 pt-2 flex-wrap">
                                <div>
                                    {authTokens && notifications.map((notification) => (
                                        <p key={notification.id} className="text-black-200">{notification.message}</p>
                                    ))}
                                </div>
                                <div className="rounded-full h-8 w-8 bg-red-200 flex items-center justify-center relative flex-wrap">
                                    <a href=""><h1 className="text-sm">pic</h1></a>
                                </div>
                                <div>
                                    <a href=""><h1 className="font-medium text-orange-500 text-sm">Mia Jensen</h1></a>
                                </div>
                                <div className="text-black-300 text-xs pt-2 pb-2">
                                    <p>curtiu sua foto </p>
                                </div>
                            </div>
                            <div className="flex items-center justify-start space-x-2 pt-2 flex-wrap">
                                <div className="rounded-full h-8 w-8 bg-red-200 flex items-center justify-center relative">
                                    <a href=""><h1 className="text-sm">pic</h1></a>
                                </div>
                                <div>
                                    <a href=""><h1 className="font-medium text-orange-500 text-sm">Mia Jensen</h1></a>
                                </div>
                                <div className="text-black-300 text-xs pt-2 pb-2">
                                    <p>comentou sua foto</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-start space-x-2  pt-2 flex-wrap">
                                <div className="rounded-full h-8 w-8 bg-red-200 flex items-center justify-center relative">
                                    <a href=""><h1 className="text-sm">pic</h1></a>
                                </div>
                                <div>
                                    <a href=""><h1 className="font-medium text-orange-500 text-sm">David Matthew</h1></a>
                                </div>
                                <div className="text-black-300 text-xs pt-2 pb-2">
                                    <p>entrou para o mesmo clã que você </p>
                                </div>
                            </div>
                            <div className="flex items-center justify-start space-x-2  pt-2 flex-wrap">
                                <div className="rounded-full h-8 w-8 bg-red-200 flex items-center justify-center relative">
                                    <a href=""><h1 className="text-sm">pic</h1></a>
                                </div>
                                <div>
                                    <a href=""><h1 className="font-medium text-orange-500 text-sm">David Matthew</h1></a>
                                </div>
                                <div className="text-black-300 text-xs pt-2 pb-2">
                                    <p>seguiu você</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-start space-x-2 pt-2 flex-wrap">
                                <div className="rounded-full h-8 w-8 bg-red-200 flex items-center justify-center relative">
                                    <a href=""><h1 className="text-sm">pic</h1></a>
                                </div>
                                <div>
                                    <a href=""><h1 className="font-medium text-orange-500 text-sm">David Matthew</h1></a>
                                </div>
                                <div className="text-black-300 text-xs pt-2 pb-2">
                                    <p>entrou para o mesmo clã que você </p>
                                </div>
                            </div>
                            <div className="flex items-center justify-start space-x-2  pt-2 flex-wrap">
                                <div className="rounded-full h-8 w-8 bg-red-200 flex items-center justify-center relative">
                                    <a href=""><h1 className="text-sm">pic</h1></a>
                                </div>
                                <div>
                                    <a href=""><h1 className="font-medium text-orange-500 text-sm">David Matthew</h1></a>
                                </div>
                                <div className="text-black-300 text-xs pt-2 pb-2">
                                    <p>entrou para o mesmo clã que você dsadsadsadsaasd dsadsadasdasdasdasdsdadsadsd</p>
                                </div>
                            </div>
                        </div>
                        </div>
                    <div className="bg-white-200 h-3/6 shadow-lg overflow-y-auto overflow-x-hidden">
                        <div className="flex flex-row items-center justify-center w-full pb-2">
                            <h1 className="font-medium text-black-200 text-center pt-2 border-b border-black-200 border-opacity-30 text-md w-4/6 text-md">Assuntos do Momento</h1>
                        </div>
                        <div className="flex flex-col items-center h-full space-y-4 w-full flex-wrap">
                            <div className="flex flex-row space-x-2 flex-wrap w-full items-center justify-center">
                                <h1 className="text-blue-500 font-semibold text-sm">Assunto: </h1>
                                <h2 className="text-orange-500 font-normal text-xs">Counter Strike 2</h2>
                            </div>
                            <div className="flex flex-row space-x-2 flex-wrap w-full items-center justify-center">
                                <h1 className="text-blue-500 font-semibold text-sm">Thread: </h1>
                                <h2 className="text-orange-500 font-normal text-xs">O LoL está acabando</h2>
                            </div>
                            <div className="flex flex-row space-x-2 flex-wrap w-full items-center justify-center">
                                <h1 className="text-blue-500 font-semibold text-sm">Noticia: </h1>
                                <h2 className="text-orange-500 font-normal text-xs">Ato 7 do Valorant, veja tudo de novo aqui.</h2>
                            </div>
                            <div className="flex flex-row space-x-2 flex-wrap w-full items-center justify-center">
                                <h1 className="text-blue-500 font-semibold text-sm">Rank: </h1>
                                <h2 className="text-orange-500 font-normal text-xs">Top 1 Jett Valorant</h2>
                            </div>
                            <div className="flex flex-row space-x-2 flex-wrap w-full items-center justify-center">
                                <h1 className="text-blue-500 font-semibold text-sm">Eventos: </h1>
                                <h2 className="text-orange-500 font-normal text-xs">Rei do LoL</h2>
                            </div>  
                            <div className="flex flex-row space-x-2 flex-wrap text-center items-center justify-center space-y-1 w-full">
                                <h1 className="text-blue-500 font-semibold text-sm">Competições: </h1>
                                <h2 className="text-orange-500 font-normal text-xs">Quinto campeonato de disputa de clãs dsakdopsakdopsakopdskaopdksaopkdsakdopsakdosakopds</h2>
                            </div>                          
                        </div>
                    </div>
                </div>

            </div>

        </div>
    );
};

export default ContentFeed;



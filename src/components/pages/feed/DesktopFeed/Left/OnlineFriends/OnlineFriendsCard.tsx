import React from "react";
import { MdSearch } from "react-icons/md";
import OnlineFriendsList from "./OnlineFriendsList";
import { TopCard } from "../../MultUseComponents/TopCard";

/** Este é o wrapper pai da lista de amigos onlines na feed page, seu intuito é ser o wrapper principal de todo o card e seus componentes filhos */
const OnlineFriendsCard = ({}) => {
  return (
    <div className="OnlineFriends-wrapper h-[350px] w-[250px] 2xl:w-[250px] max-h-[350px] shadow-lg rounded-lg flex items-center flex-col gap-3">
      <TopCard title={"Amigos online"} />
      <div className="flex items-center justify-center pt-4 w-5/6 pl-6 gap-5 ">
        <MdSearch className="w-1/6 h-6 OnlineFriends-search-icon" />
        <input
          type="search"
          placeholder="Pesquisar"
          className="w-full bg-transparent h-full rounded-lg focus:outline-none text-black-400 text-left"
        ></input>
      </div>
      <OnlineFriendsList />
      <div className="OnlineFriendsCard-expand text-center pt-4 font-light">
        <a href="">
          <h1>Ver Todos</h1>
        </a>
      </div>
    </div>
  );
};

export default OnlineFriendsCard;

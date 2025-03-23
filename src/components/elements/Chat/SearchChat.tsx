import React from "react";
import { IoIosSearch } from "react-icons/io";

function SearchChat() {
  return (
    <div className="p-3 SearchChat-wrapper flex-shrink-0">
      <div className="SearchChat-input rounded-full flex items-center p-2">
        <IoIosSearch className="ml-1" size={20} />
        <input
          type="text"
          placeholder="Pesquisar"
          className="bg-transparent border-none focus:outline-none w-full pl-2 text-sm"
        />
      </div>
    </div>
  );
}

export default SearchChat;

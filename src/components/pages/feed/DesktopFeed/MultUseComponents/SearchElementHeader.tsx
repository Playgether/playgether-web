import React from "react";
import { MdSearch, MdOutlineHome } from "react-icons/md";

const SearchElement = ({}) => {
  return (
    <div className=" w-full h-full flex items-center flex-1">
      <div className="SearchElement-container w-5/6 rounded-lg h-4/6 flex items-center text-opacity-60">
        <MdSearch className="w-1/6 h-5/6 SearchElement-icon" />
        <input
          type="search"
          placeholder="Pesquisar"
          className="SearchElement-input w-full h-full rounded-lg focus:outline-none "
        ></input>
      </div>
      <div className="h-full flex items-center justify-center SearchElement-home-icon text-opacity-90 ml-2">
        <MdOutlineHome className="h-4/6 w-5/6 " />
      </div>
    </div>
  );
};

export default SearchElement;

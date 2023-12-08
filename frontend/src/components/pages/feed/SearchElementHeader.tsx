import React from "react";
import {MdSearch, MdOutlineHome} from "react-icons/md";
import { FiAlignJustify } from "react-icons/fi";
import { ResponsiveHearderItems } from "../../layouts/ResponsiveHeaderItems";
import { ItemsHeader } from "../../layouts/HeaderItems";

const SearchElement = ({}) => {
    return (
        <div className=" w-full h-full flex items-center flex-1">
            <div className="bg-white-200 bg-opacity-60  w-5/6 rounded-lg h-4/6 flex items-center text-black-200 text-opacity-60">
                <MdSearch className="w-1/6 h-5/6"/>
                <input type='search' placeholder='Pesquisar' className="bg-white-200 bg-opacity-10 w-full h-full rounded-lg focus:outline-none text-black-400"></input>
            </div>
            <div className="h-full flex items-center justify-center text-black-300 text-opacity-90 ml-2">
                <MdOutlineHome className="h-4/6 w-5/6"/>
            </div>
        </div>
    );
}

export default SearchElement
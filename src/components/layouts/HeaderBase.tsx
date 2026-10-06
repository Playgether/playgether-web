import React from "react";
import SearchElement from "../pages/feed/DesktopFeed/MultUseComponents/SearchElementHeader";
import IconsHeader from "./IconsHeader";
import { BrandLogo } from "@/components/general/BrandLogo";
import { ItemsHeader } from "./HeaderItems";

const HeaderBase = ({}) => {
  return (
    <>
      <div className="w-full HeaderBase-wrapper h-14 flex flex-row lg:space-x-16">
        <div className="lg:w-32 w-20 h-full ml-6 ">
          <div className="relative w-4/6 lg:w-full h-full flex items-center justify-center">
            <BrandLogo className="h-auto w-full" />
          </div>
        </div>

        <SearchElement />
        <IconsHeader>
          <ItemsHeader />
        </IconsHeader>
      </div>
    </>
  );
};

export default HeaderBase;

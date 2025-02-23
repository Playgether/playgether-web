import React from "react";
import { MiddleFeedContextProvider } from "@/context/MiddleFeedContext";
import MiddleWrapper from "./MiddleWrapper";

const Middle = () => {
  return (
    <MiddleFeedContextProvider>
      <MiddleWrapper />
    </MiddleFeedContextProvider>
  );
};
export default Middle;

"use client";

import React, { useState } from "react";
import { BsChatSquare } from "react-icons/bs";
import ButtonClose from "../elements/ButtonClose/ButtonClose";
import { motion, AnimatePresence } from "framer-motion";

function AsideBaseChat({ children }: { children: React.ReactNode }) {
  const [shouldShow, setShouldShow] = useState(false);
  return (
    <>
      <AnimatePresence>
        {shouldShow && (
          <motion.div
            className="absolute z-10 left-20 min-w-[50vw] top-0 h-[calc(100vh-160px)] flex motion-preset-slide-right-sm"
            exit={{ opacity: 0 }}
            transition={{ type: "tween", duration: 0.3 }}
          >
            {children}
            <ButtonClose
              className="h-10 mt-2"
              onClick={() => setShouldShow(false)}
            >
              X
            </ButtonClose>
          </motion.div>
        )}
      </AnimatePresence>

      <BsChatSquare
        className="h-8 w-8 cursor-pointer"
        onClick={() => setShouldShow(!shouldShow)}
      />
    </>
  );
}

export default AsideBaseChat;

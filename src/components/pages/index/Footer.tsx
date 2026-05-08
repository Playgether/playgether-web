"use client";

import React from "react";

const Footer = () => {
  const date = new Date();
  return (
    <p className="absolute bottom-8 left-0 right-0 text-center text-muted-foreground text-sm tracking-wider z-10">
      <span>@{date.getFullYear()} ALL RIGHTS RESERVED</span>
    </p>
  );
};

export default Footer;

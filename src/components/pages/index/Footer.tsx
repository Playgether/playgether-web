import React from "react";

const Footer = () => {
  const date = new Date();
  return (
    <p className="pointer-events-none absolute bottom-8 left-0 right-0 text-center text-muted-foreground text-sm tracking-wider z-10">
      @{date.getFullYear()} ALL RIGHTS RESERVED
    </p>
  );
};

export default Footer;

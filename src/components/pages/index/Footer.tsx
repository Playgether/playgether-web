import React from "react";

const Footer = () => {
    const date = new Date();
    return (
    <div className='flex flex-col items-center justify-center'>
        <h1 className='text-white-200 text-xl text-center font-medium'>@{date.getFullYear()} ALL RIGHTS RESERVED</h1>
    </div>
    );
};

export default Footer
'use client'
import React from "react";
import Left from "./Left";
import Middle from "./Middle";
import Right from "./Right";
import Container from "./Container"

const ContentFeed = () => {
    return (
        <Container>
            <Left />
            <Middle />
            <Right />
        </Container>
    );
};

export default ContentFeed;



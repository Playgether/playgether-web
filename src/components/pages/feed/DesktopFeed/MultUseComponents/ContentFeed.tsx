'use client'
import React from "react";
import Container from "./Container"
import Left from "../Left/Left";
import Middle from "../Middle/Middle";
import Right from "../Right/Right";

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



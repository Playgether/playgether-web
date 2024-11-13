import React from "react";
import {Meta, StoryObj} from "@storybook/react"
import { CardGames } from "./CardGames";
import CardImage from "./CardImage"

const meta: Meta<typeof CardGames> = {
    component: CardGames,
    parameters: {
        layout: 'centered'
    },
    tags: ['autodocs'],
}

export default meta;

type story = StoryObj<typeof CardGames>;
/** Formato padrão */

export const Primary: story = {
    args: {
        children: <CardImage src="/games/League of Legends.png" alt="LoL Banner" />
    }
}
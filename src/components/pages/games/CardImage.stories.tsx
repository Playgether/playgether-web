import React from "react";
import { Meta, StoryObj } from "@storybook/react";
import { CardGames } from "./CardGames";
import CardImage from "./CardImage";

const meta: Meta<typeof CardImage> = {
  component: CardImage,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    () => {
      return (
        <section className="flex gap-4 mt-20">
          <CardGames onClick={() => {}}>
            <CardImage src="/games/League of Legends.png" alt="LoL Banner" />
          </CardGames>

          <CardGames onClick={() => {}}>
            <CardImage src="/games/Valorant.png" alt="Valorant Banner" />
          </CardGames>

          <CardGames onClick={() => {}}>
            <CardImage src="/games/Counter Strike 2.png" alt="LoL Banner" />
          </CardGames>
        </section>
      );
    },
  ],
};

export default meta;

type story = StoryObj<typeof CardImage>;
/** Formato padrão */

export const Primary: story = {
  args: {
    className:
      "h-auto w-full object-contain rounded-sm transition-transform duration-300 ease-in-out transform hover:scale-110",
  },
};

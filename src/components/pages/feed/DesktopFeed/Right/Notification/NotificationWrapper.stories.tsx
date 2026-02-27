import { NotificationWrapper } from "./NotificationWrapper";
import type { Meta, StoryObj } from "@storybook/react";
import { NotificationWrapperProps } from "./NotificationWrapper";
import React from "react";

const meta: Meta<NotificationWrapperProps> = {
  component: NotificationWrapper,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<NotificationWrapperProps>;

export const Default: Story = {
  args: {
    children: <div>David Matthew entrou para o mesmo clã que você.</div>,
  },
};

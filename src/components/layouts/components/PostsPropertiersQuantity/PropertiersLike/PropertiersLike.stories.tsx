import PropertiersLike from "./PropertiersLike";
import type { Meta, StoryObj } from "@storybook/react";
import PropertiersLikeProps from "./PropertiersLike";
import { LikeContentType } from "../../../../content_types/LikeContentType";
import { action } from "@storybook/addon-actions";

const meta: Meta<typeof PropertiersLikeProps> = {
  component: PropertiersLike,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof PropertiersLikeProps>;

/** Formato padrão */
export const Default: Story = {
  args: {
    quantitylikesNumber: 108,
    clicked: false,
    content_type: LikeContentType.post,
    object_id: 1,
  },
};

/** Perceba que o ícone de "like" vem preenchido agora, ou seja, já curtido. */
export const WithUserAlreadyLikeTrue: Story = {
  args: {
    quantitylikesNumber: 108,
    clicked: true,
    content_type: LikeContentType.post,
    object_id: 1,
  },
};

/** Perceba que o ícone de "like" mudou de cor. */
export const WithIconClassName: Story = {
  args: {
    quantitylikesNumber: 108,
    clicked: true,
    content_type: LikeContentType.post,
    object_id: 1,
    iconClassName: "text-orange-500",
  },
};

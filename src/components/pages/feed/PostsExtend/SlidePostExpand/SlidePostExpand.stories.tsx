import { Meta, StoryObj } from "@storybook/react";
import { SlidePostExpand, SlidePostExpandProps } from "./SlidePostExpand";
import { PostMedias } from "../../../../../app/feed/types/PostMediaProps";

const medias: PostMedias[] = [
  {
    id: 1,
    media_file:
      "https://images.unsplash.com/photo-1529665253569-6d01c0eaf7b6?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8cHJvZmlsZXxlbnwwfHwwfHx8MA%3D%3D",
    media_type: "image",
    post: 1,
    position: 0,
    width: 1920,
    height: 1080,
    bytes_file: 500000,
    file_format: "jpg",
    created_at: new Date("2024-01-01"),
    media_folder: "posts",
  },
  {
    id: 2,
    media_file:
      "https://images.unsplash.com/photo-1628563694622-5a76957fd09c?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aW5zdGFncmFtJTIwcHJvZmlsZXxlbnwwfHwwfHx8MA%3D%3D",
    media_type: "image",
    post: 1,
    position: 1,
    width: 1920,
    height: 1080,
    bytes_file: 500000,
    file_format: "jpg",
    created_at: new Date("2024-01-01"),
    media_folder: "posts",
  },
];

const meta: Meta<SlidePostExpandProps> = {
  component: SlidePostExpand,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<SlidePostExpandProps>;

export const Default: Story = {
  args: {
    medias: medias,
    slideIndex: 0,
  },
};

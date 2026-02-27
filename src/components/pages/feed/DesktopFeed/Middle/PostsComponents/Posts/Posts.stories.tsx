import Posts from "./Posts";
import { Meta, StoryObj } from "@storybook/react";
import { PostsProps } from "./Posts";
import { action } from "@storybook/addon-actions";
import { PostMedias } from "../../../../../../../app/feed/types/PostMediaProps";

var slideIndex = 0;
const setSlideIndex = (number: number) => {
  slideIndex = number;
};
const mockPosts: PostMedias[] = [
  {
    id: 1,
    media_file:
      "https://images.unsplash.com/photo-1529665253569-6d01c0eaf7b6?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8cHJvZmlsZXxlbnwwfHwwfHx8MA%3D%3D",
    position: 0,
    media_type: "image",
    post: 1,
    width: 1000,
    height: 1000,
    bytes_file: 1024,
    file_format: "jpg",
    created_at: new Date(),
    media_folder: "posts/images",
  },
  {
    id: 2,
    media_file:
      "https://images.unsplash.com/photo-1628563694622-5a76957fd09c?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aW5zdGFncmFtJTIwcHJvZmlsZXxlbnwwfHwwfHx8MA%3D%3D",
    position: 1,
    media_type: "image",
    post: 1,
    width: 1000,
    height: 1000,
    bytes_file: 1024,
    file_format: "jpg",
    created_at: new Date(),
    media_folder: "posts/images",
  },
];

const meta: Meta<typeof Posts> = {
  component: Posts,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;

type Story = StoryObj<PostsProps>;

/** Formato padrão */
export const Default: Story = {
  args: {
    media: mockPosts,
    className: "h-60 w-60",
  },
};

/** Perceba que o tamanho do block foi aumentado */
export const WithBlockBigger: Story = {
  args: {
    media: mockPosts,
    className: "h-96 w-96",
  },
};

/** Perceba que agora as medias possuem metade do tamanho do container (Estão saindo dele no Storybook porq o slide não esta sendo exibido, mas no componente funcionaria,
 * mas ainda assim, o tamanho de cada media neste caso é metade do tamanho do container onde a borda está pegando) */
export const WithImageHalfOfTheContainer: Story = {
  args: {
    media: mockPosts,
    className: "h-80 border-solid border-4 border-light-blue-500 w-80",
  },
};

/** Passando o onClick agora, perceba que em Actions no StoryBook, conseguimos visualizar a função sendo executada quando clicamos em alguma media */
export const withOnClick: Story = {
  args: {
    media: mockPosts,
    className: "h-60 w-60",
    onClick: () => {
      action("Você clicou na media")();
      setSlideIndex(0);
    },
  },
};

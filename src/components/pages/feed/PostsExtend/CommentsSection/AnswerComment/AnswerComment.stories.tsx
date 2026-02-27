import { Meta, StoryObj } from "@storybook/react";
import { AnswerComment, FormCommentProps } from "./AnswerComment";
// import { http, HttpResponse } from 'msw'
import { action } from "@storybook/addon-actions";

const meta: Meta<typeof AnswerComment> = {
  component: AnswerComment,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<FormCommentProps>;
export const Primary: Story = {
  args: {
    object_id: 1,
  },
  // parameters: {
  //     msw: {
  //         handlers: [
  //             http.post('/comments', () => {
  //                 return HttpResponse.json({
  //                     success:true
  //                 })
  //             })
  //         ]
  //     }
  // }
};

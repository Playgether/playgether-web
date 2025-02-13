import { Meta, StoryObj } from "@storybook/react";
import ControlledModal from "./ControlledModal";
import { action } from "@storybook/addon-actions";
import DefaultButton from "../DefaultButton/DefaultButton";
import ButtonClose from "../ButtonClose/ButtonClose";
import { useState } from "react";

const meta: Meta<typeof ControlledModal> = {
  component: ControlledModal,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;

const ControlledModalStory = (args) => {
  const [shouldShow, setShouldShow] = useState(args.shouldShow);

  return (
    <ControlledModal
      shouldShow={shouldShow}
      onRequestClose={() => {
        action("Você fechou o Modal")();
        setShouldShow(false);
      }}
    >
      <div className="flex flex-col bg-white justify-center items-center h-60 gap-6 pt-16 rounded-lg p-16">
        <p className="text-black-400">
          Este é exemplo de um modal com duas opções
        </p>
        <DefaultButton
          className="py-4 px-4"
          onClick={() => action("Você continuou com a ação")()}
        >
          Continuar
        </DefaultButton>
        <ButtonClose
          onClick={() => {
            action("Você fechou o Modal")();
            setShouldShow(false);
          }}
        >
          Fechar
        </ButtonClose>
      </div>
    </ControlledModal>
  );
};

type Story = StoryObj<typeof ControlledModal>;
export const Primary: Story = {
  render: ControlledModalStory,
  args: {
    shouldShow: true,
  },
};

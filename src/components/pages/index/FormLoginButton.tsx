"use client";
import DefaultButton from "@/components/elements/DefaultButton/DefaultButton";
import { LoadingComponent } from "@/components/layouts/components/LoadingComponent";
import React from "react";
import { useFormStatus } from "react-dom";

function FormLoginButton() {
  const { pending } = useFormStatus();
  return (
    <>
      {pending ? (
        <>
          <DefaultButton
            className="flex gap-2 w-full leading-none shadow px-8, py-4 items-center justify-center"
            type="submit"
          >
            <LoadingComponent
              className="h-6 w-6"
              text="Logando..."
              showText={true}
            />
          </DefaultButton>
        </>
      ) : (
        <div className="mb-4">
          <DefaultButton
            className="w-full leading-none shadow px-8, py-4"
            type="submit"
          >
            LOGAR
          </DefaultButton>
        </div>
      )}
    </>
  );
}

export default FormLoginButton;

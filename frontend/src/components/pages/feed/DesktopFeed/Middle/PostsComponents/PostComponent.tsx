'use client'

import { useState } from "react";
import Step2 from "./SharePost/Step2";
import Step1 from "./SharePost/Step1";
import Step3 from "./SharePost/Step3";
import { IoCaretBackOutline, IoCaretForwardOutline } from "react-icons/io5";
import OrangeButton from "../../../../../elements/OrangeButton/OrangeButton";
import { PostFormSchema } from "./SharePost/PostFormSchema";
import { UseFormState } from "../../../../../layouts/ConstFormStateLayout";

const PostComponent = ({}) => {
    const [step, setStep] = useState(1)
    const Step1Schema = PostFormSchema()
    const { register, handleSubmit, errors } = UseFormState(Step1Schema);

    const nextStep = () => {
        handleSubmit(() => {
            if (step < 3) {
                setStep(step + 1);
            }
        })();
    }

    const previousStep = () => {
        if (step > 1){
            setStep(step - 1)
        }
    }

    const returnFirstStep = () => {
        setStep(1)
    }


    return (
        <div className='w-full bg-white-200 h-[300px] mt-2 rounded-lg flex flex-col shadow-lg mb-4 gap-1'>
            <div className='w-full text-center text-black-200 pt-1'>
                {step === 1 && (
                    <h1>Texto</h1>
                )}
                {step === 2 && (
                    <h1>Media</h1>
                )}
                {step === 3 && (
                    <h1>Sucesso</h1>
                )}
                <div className="border-b border-black-200 border-opacity-30 pt-1"></div>
            </div>
            <form className="h-full">
                {step === 1 && (
                    <Step1 register={register} errors={errors}/>
                )}
                {step === 2 && (
                    <Step2/>
                )}
                {step === 3 && (
                    <div className="h-full flex flex-col align-center justify-center gap-2">
                    <Step3/>
                    <OrangeButton className="py-2 px-2" onClick={()=> returnFirstStep()}>Finalizar</OrangeButton>
                    </div>
                )}
            </form>
            {step != 3 && (
                <div className=" relative flex justify-between mb-3 p-2">
                    <IoCaretBackOutline className='h-12 w-12 text-black-200 cursor-pointer' onClick={() => previousStep()}></IoCaretBackOutline>
                    <IoCaretForwardOutline className='h-12 w-12 text-black-200 cursor-pointer' onClick={() => nextStep()}></IoCaretForwardOutline>
                </div>
            )}
        </div>
    );
};

export default PostComponent;
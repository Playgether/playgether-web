'use client'

import { useEffect, useState } from "react";
import Step2 from "./SharePost/Step2";
import Step1 from "./SharePost/Step1";
import Step3 from "./SharePost/Step3";
import { IoCaretBackOutline, IoCaretForwardOutline } from "react-icons/io5";
import OrangeButton from "../../../../../elements/OrangeButton/OrangeButton";
import { PostFormSchema } from "./SharePost/PostFormSchema";
import { UseFormState } from "../../../../../layouts/ConstFormStateLayout";
import { useAuthContext } from "../../../../../../context/AuthContext";
import { SubmitingForm } from "../../../../../layouts/SubmitingFormLayout";
import { postPost } from "../../../../../../services/postPost";
import Step4 from "./SharePost/Step4";


type dataForm = {
    text: string,
}
const PostComponent = ({}) => {
    const [step, setStep] = useState(1)
    const Step1Schema = PostFormSchema()
    const { register, handleSubmit, errors, reset } = UseFormState(Step1Schema);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const {user, authTokens} = useAuthContext();

    const nextStep = () => {
        handleSubmit(() => {
            if (step < 4){
                setStep(step + 1)
            }
        })();
    }

    const makeRequestWithoutMedia = () => {
        if (uploadedFiles.length === 0){
            handleSubmit(makeUploadRequest)()
        }      
    } 

    const previousStep = () => {
        if (step > 1){
            setStep(step - 1)
        }
    }

    const returnFirstStep = () => {
        setUploadedFiles([])
        setStep(1)
        reset({ text: "" });
    }

    const makeUploadRequest = async(data:dataForm) => {
        var hasPostMedia = false
        if (uploadedFiles.length > 0) { hasPostMedia = true}
        const newPost = {
            comment:data.text,
            created_by_user:user?.user_id,
            has_post_media:hasPostMedia,
            medias: hasPostMedia ? uploadedFiles : []
        }
        try {
            const response = await SubmitingForm(() => postPost(newPost, authTokens));
            if (response.status === 201){
                setStep(4)
            }
        } catch (error) {
            console.log(error)
            throw new Error(error.message)
        }
    }

    return (
        <div className='w-full bg-white-200 h-[300px] mt-2 rounded-lg flex flex-col shadow-lg mb-4 gap-1'>
            <div className='w-full text-center text-black-200 pt-1'>
                {step === 1 && (
                    <h1>Texto</h1>
                )}
                {(step === 2 || step === 3) &&(
                    <h1>Media</h1>
                )}
                {step === 4 && (
                    <h1>Sucesso</h1>
                )}
                <div className="border-b border-black-200 border-opacity-30 pt-1"></div>
            </div>
            <form className="h-full" onSubmit={step === 3 ? handleSubmit(makeUploadRequest) : (e) => e.preventDefault()}>
                {step === 1 && (
                    <Step1 register={register} errors={errors}/>
                )}
                {step === 2 && (
                    <Step2 nextStep={nextStep} makeRequestWithoutMedia={makeRequestWithoutMedia}/>
                )}
                {step === 3 && (
                    <div className="h-full flex flex-col align-center justify-center gap-2">
                    <Step3 returnFirstStep={returnFirstStep} setUploadedFiles={setUploadedFiles} makeUploadRequest={makeUploadRequest} handleSubmit={handleSubmit} uploadedFiles={uploadedFiles}/>
                    </div>
                )}
                {step === 4 && (
                    <div className="h-full flex flex-col align-center justify-center gap-2">
                    <Step4 />
                    <OrangeButton className="py-2 px-2" onClick={()=> returnFirstStep()}>Finalizar</OrangeButton>
                    </div>
                )}
            </form>
            {step !== 4 && (
                <div className=" relative flex justify-between mb-3 p-2">

                    <IoCaretBackOutline className='h-12 w-12 text-black-200 cursor-pointer' onClick={() => previousStep()}></IoCaretBackOutline>
                    { step !== 2 && step !== 3 &&(
                        <IoCaretForwardOutline className='h-12 w-12 text-black-200 cursor-pointer' onClick={() => nextStep()}></IoCaretForwardOutline>
                    )}
                </div>
            )}
        </div>
    );
};

export default PostComponent;
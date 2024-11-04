'use client'

import { GoFileMedia } from "react-icons/go";
import OrangeButton from '../../../../../elements/OrangeButton/OrangeButton';
import { CldUploadWidget } from "next-cloudinary";
import { useAuthContext } from "../../../../../../context/AuthContext";
import { v4 as uuidv4} from 'uuid';

const PostComponent = ({}) => {
    const {user} = useAuthContext()

    const generatePublicId = () => {
        const randomValue = uuidv4()
        return `${user?.username}_${randomValue}`;
    }

    const getCurrentDate = () => {
        const date = new Date();
        return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    };


    return (

        <div className='w-full bg-white-200 h-[300px] mt-2 rounded-lg flex flex-col shadow-lg mb-4'>
            <div className='w-full text-center text-black-200 pt-1'>
                <h1>Postar</h1>
                <div className="border-b border-black-200 border-opacity-30 pt-1"></div>
            </div>
            <div className='flex flex-row h-full items-center justify-end w-full pb-16 pl-3 space-x-3 flex-grow '>
                <div className="rounded-full md:h-12 md:w-16 2xl:h-16 2xl:w-20 xl:h-16 xl:w-20 bg-red-200 flex items-center justify-center relative">
                    <h1 className="text-sm">pic</h1>
                </div>
                <div className='w-full h-full flex-grow'>
                    <div className='text-black-200 opacity-50 h-full w-full bg-white-200 mt-7'>
                        <textarea placeholder='Compartilhe algo conosco' className="bg-white-200 bg-opacity-10 w-full h-full rounded-lg focus:outline-none text-black-400 pt-6"></textarea>
                    </div>
                </div>
                <div className='flex-grow'>
                    <div className='flex justify-end pr-3'>
                    <CldUploadWidget 
                    signatureEndpoint="/api/signed-posts"
                    options={{
                        sources:['local'],
                        minImageHeight:320,
                        minImageWidth:320,
                        maxFiles:5,
                        tags:[`${user?.username}`, getCurrentDate(), "post", "user"],
                        detection:"unidet",
                        maxFileSize:5000000,
                        maxVideoFileSize:50000000,
                        validateMaxWidthHeight:true,
                        language:"pt",
                        showCompletedButton:true,
                    }}
                    >
                        {({ open }) => {
                            return (
                            <GoFileMedia className='h-12 w-12 text-black-200 cursor-pointer' onClick={() => open()}/>
                            );
                        }}
                    </CldUploadWidget>
                    </div>   
                </div>
            </div>
            <div className='pb-4 w-full flex items-center justify-center'>
                <OrangeButton className="w-5/6">Compartilhar</OrangeButton>
            </div>
        </div>
    );
};

export default PostComponent;
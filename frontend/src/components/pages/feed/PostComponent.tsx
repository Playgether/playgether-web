import React from 'react'
import { GoFileMedia } from "react-icons/go";
import Button from '../../elements/OrangeButton';

const PostComponent = ({}) => {

    return (

        <div className='w-full bg-white-200 h-2/6 mt-2 rounded-lg flex flex-col shadow-lg'>
            <div className='w-full text-center text-black-200 pt-1'>
                <h1>Postar</h1>
                <div className="border-b border-black-200 border-opacity-30 pt-1"></div>
            </div>
            <div className='flex flex-row h-full items-center justify-end w-full pb-16 pl-3 space-x-3 flex-grow '>
                <div className="rounded-full md:h-12 md:w-16 2xl:h-16 2xl:w-20 xl:h-16 xl:w-20 bg-red-200 flex items-center justify-center relative">
                    <h1 className="text-sm">pic</h1>
                </div>
                <div className='w-full h-full flex-grow'>
                    <div className='text-black-200 opacity-50 h-full w-full bg-white-200'>
                        <textarea placeholder='Compartilhe algo conosco' className="bg-white-200 bg-opacity-10 w-full h-full rounded-lg focus:outline-none text-black-400"></textarea>
                    </div>
                </div>
                <div className='flex-grow'>
                    <div className='flex justify-end pr-3'>
                        <GoFileMedia className='h-12 w-12'/>
                    </div>   
                </div>
            </div>
            <div className='pb-4 w-full flex items-center justify-center'>
                <Button onClick={null} extraClassName={"w-5/6"}>Compartilhar</Button>
            </div>
        </div>

    );

};

export default PostComponent;
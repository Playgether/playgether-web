import Image from 'next/image'
import React from 'react'
import DuoProfileCard from './cards/DuoProfileCard'
import SelectUserRoles from './cards/SelectUserRoles'
import DefaultButton from '@/components/elements/DefaultButton/DefaultButton'

interface DuoStep1Props {
    onNextStep: () => void
    myRole: string;
    setMyRole: (role: string) => void;
}

export default function DuoStep1({ onNextStep, myRole, setMyRole }: DuoStep1Props) {
  return (
        <>
            <div className='w-full'>
                <div className='py-4 text-3xl font-bold text-center text-[#008BF5]' >
                    League of Legends
                </div>

                <div className='flex justify-center mt-10'>
                    <Image src="/duo/lol.svg" width={50}height={50} alt='teste'></Image>
                </div>

                <div className='flex justify-center gap-20'>
                    <div>
                        <DuoProfileCard/>
                    </div>
                    <div>
                        <SelectUserRoles value={myRole} onChange={setMyRole} />
                    </div>
                </div>
                
                <div className='flex justify-center my-10'>
                    <DefaultButton 
                        className="text-sm font-semibold xl:px-6 2xl:py-3 lg:px-6 lg:py-2"
                        onClick={onNextStep}
                        disabled={!myRole}
                    >
                        Continuar
                    </DefaultButton>
                </div>
            </div>
        </>
  )
}

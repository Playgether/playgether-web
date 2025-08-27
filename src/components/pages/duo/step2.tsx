import Image from 'next/image'
import DefaultButton from '@/components/elements/DefaultButton/DefaultButton'
import React from 'react'
import SelectSearchRoles from './cards/SelectSearchRoles'
import SelectSearchRank from './cards/SelectSearchRank'

interface DuoStep2Props {
    onBackToStep1: () => void
    onNextStep: () => void
    searchRole: string;
    setSearchRole: (role: string) => void;
    searchRank: string;
    setSearchRank: (rank: string) => void;
}

export default function DuoStep2({ onBackToStep1, onNextStep, searchRole, setSearchRole, searchRank, setSearchRank }: DuoStep2Props) {
  return (
        <div className='w-full'>
                        <div className='py-4 text-3xl font-bold text-center text-[#008BF5]' >
                            League of Legends
                        </div>
        
                        <div className='flex justify-center mt-10'>
                            <Image src="/duo/lol.svg" width={50}height={50} alt='teste'></Image>
                        </div>
        
                        <div className='flex justify-center gap-20'>
                            <div>
                                <SelectSearchRank value={searchRank} onChange={setSearchRank} />
                            </div>
                            <div>
                                <SelectSearchRoles value={searchRole} onChange={setSearchRole} />
                            </div>
                        </div>

        <div className='flex justify-center my-10 gap-5'>
            <DefaultButton 
                className="text-sm font-semibold xl:px-6 2xl:py-3 lg:px-6 lg:py-2"
                onClick={onBackToStep1}
            >
                Voltar
            </DefaultButton>

            <DefaultButton 
                className="text-sm font-semibold xl:px-6 2xl:py-3 lg:px-6 lg:py-2"
                onClick={onNextStep}
                disabled={!searchRole || !searchRank}
            >
                Buscar
            </DefaultButton>
        </div>
    </div>
  )
}

import Image from 'next/image'
import DefaultButton from '@/components/elements/DefaultButton/DefaultButton'
import React from 'react'
import { usersInQueue } from './finder/finder';

interface DuoStep3Props {
    onBackToStep1: () => void
    myRole: string;
    searchRole: string;
    searchRank: string;
}

export default function DuoStep3({ onBackToStep1, myRole, searchRank, searchRole }: DuoStep3Props) {
    const filteredPlayers = usersInQueue.filter(
        player => player.role === searchRole && player.rank.includes(searchRank) && player.search_role === myRole
    )
  return (
        <div className='w-full'>
                        <div className='py-4 text-3xl font-bold text-center text-[#008BF5]' >
                            League of Legends
                        </div>
        
                        <div className='flex justify-center mt-10'>
                            <Image src="/duo/lol.svg" width={50}height={50} alt='teste'></Image>
                        </div>
        
                        <div className='flex flex-wrap justify-center gap-20'>
                                {filteredPlayers.length === 0 && (
                                    <div className='text-gray-500'>Nenhum jogador encontrado</div>
                                )}

                                {filteredPlayers.map(player => (
                                    <div key={player.id} className='bg-white-200 rounded shadow p-4 w-64 text-[#008BF5]'>
                                        <div className='font-bold text-lg'>{player.nick} <span className='text-xs text-gray-400'>{player.tag}</span></div>

                                        <div>Rota: <b>{player.role}</b></div>
                                        <div>Rank: <b>{player.rank}</b></div>
                                        <div>Busca: <b>{player.search_role}</b></div>
                                    </div>
                                ))}
                        </div>

        <div className='flex justify-center my-10'>
            <DefaultButton 
                className="text-sm font-semibold xl:px-6 2xl:py-3 lg:px-6 lg:py-2"
                onClick={onBackToStep1}
            >
                Voltar
            </DefaultButton>
        </div>
    </div>
  )
}

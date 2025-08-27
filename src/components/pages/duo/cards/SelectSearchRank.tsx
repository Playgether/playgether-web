import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Image from 'next/image'
import React, { useState } from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

const roleSchema = z.object({
    selectedRoles: z.string().min(1, 'Pelo menos uma rota deve ser selecionada')
})

type FormData = {
    selectedRoles: string
}

interface SelectSearchRolesProps {
  value: string;
  onChange: (rank: string) => void;
}
 
export default function SelectSearchRoles({ value, onChange }: SelectSearchRolesProps) {

    const { handleSubmit, control, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(roleSchema),
        defaultValues: { selectedRoles: '' }
    })

    const rank = [
        { rank: 'Iron'},
        { rank: 'Bronze'},
        { rank: 'Silver'},
        { rank: 'Gold'},
        { rank: 'Platinum'},
        { rank: 'Diamond'},
        { rank: 'Emerald'},
        { rank: 'Master'},
        { rank: 'Grandmaster'},
        { rank: 'Challenger' }
    ]

    const handleSelectRole = (rank: string) => {
        onChange(rank)
    }

    const onSubmit = (data: FormData) => {
        console.log('Rotas selecionadas', data.selectedRoles)
    }


   return (
    <div className="w-full flex justify-center mt-[3rem]">
        <Card className="bg-[#E0E0E0] w-[17rem] h-[24rem] shadow-md">
            <CardHeader>
                <CardTitle className="text-[#008BF5] text-center font-extrabold text-xl">
                    <div>
                        Qual rota deseja jogar?
                    </div> 
                </CardTitle>
            </CardHeader>

            <CardContent className="flex flex-col items-center justify-center text-xl font-extrabold gap-2">
                
                <div>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div>
                            {rank.map(({ rank }) => (
                                <div 
                                    key={rank} 
                                    onClick={() => handleSelectRole(rank)}
                                >
                                    <p className={`
                                        ${value === rank ? 'text-[#0056b3] font-bold' : 'text-[#008BF5]'}
                                        hover:text-[#0056b3] cursor-pointer`}> 
                                        {rank}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {errors.selectedRoles && <div>{errors.selectedRoles.message}</div>}
                    </form>
                </div>
            </CardContent>
        </Card>
    </div>
   )
 }
 
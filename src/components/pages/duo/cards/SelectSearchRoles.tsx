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
  onChange: (role: string) => void;
}
 
export default function SelectSearchRoles({ value, onChange }: SelectSearchRolesProps) {

    const { handleSubmit, control, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(roleSchema),
        defaultValues: { selectedRoles: '' }
    })

    const roles = [
        { role: 'Top', image: '/duo/lol/top.jpg' },
        { role: 'Jungle', image: '/duo/lol/jg.png' },
        { role: 'Mid', image: '/duo/lol/mid.jpg' },
        { role: 'ADC', image: '/duo/lol/adc.jpg' },
        { role: 'Support', image: '/duo/lol/supp.webp' }
    ]

    const handleSelectRole = (role: string) => {
        onChange(role)
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
                            {roles.map(({ role, image }) => (
                                <div 
                                    key={role} 
                                    onClick={() => handleSelectRole(role)}
                                >
                                    <Image src={image} alt={role} height={40} width={40} className={`mb-2 rounded cursor-pointer border ${value === role ? 'border-[#008BF5]' : 'border-transparent'} hover:border-[#008BF5]`} />
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
 
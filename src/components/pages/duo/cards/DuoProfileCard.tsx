 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Image from 'next/image'
import React from 'react'
 
 export default function DuoProfileCard() {
   return (
    <div className="w-full flex justify-center mt-[3rem]">
        <Card className="bg-[#E0E0E0] w-[17rem] h-[24rem] shadow-md">
            <CardHeader>
                <CardTitle className="text-[#008BF5] text-center font-extrabold text-xl">
                    <div>
                        Vayne Panicat
                    </div>
                    <div>
                        #Veiga
                    </div>
                </CardTitle>
            </CardHeader>

            <CardContent className="flex flex-col items-center justify-center text-xl font-extrabold gap-2">
                <div className="text-[#008BF5] text-center font-extrabold text-xl py-8">
                    Ferro I
                </div>

                <div>
                    <Image src="/duo/Group27.svg" alt='teste' height={100} width={100}></Image>
                </div>
            </CardContent>
        </Card>
    </div>
   )
 }
 
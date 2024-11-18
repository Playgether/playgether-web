import React from 'react'
import { CustomToast, CustomToaster } from '@/components/ui/customSonner'

export const ProfileCS2 = () => {
  return (
    <>
        <button 
            className='text-black-500'
            onClick={
                () => CustomToast.error('Event has been created', 
                    { 
                        duration: 2000, 
                        description: "Monday, November 8, 2024 at 12:12 AM", 
                        action: {
                            label: "close",
                            onClick: () => console.log(CustomToast.success('botão close clicado', { duration: 2000 }) ),
                        }, 
                    }
                )
            }
        >
            teste custom
        </button>
        <CustomToaster />
    </>
  )
}
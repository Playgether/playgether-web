"use client"
import DefaultButton from '@/components/elements/DefaultButton/DefaultButton'
import React from 'react'

function DefaultButtonWrapper({text, func}: {text?: string, func?: () => void}) {
  return (
    <div>
        <DefaultButton className='px-4 py-4' onClick={() => text ? console.log(text): func() }>
            Click Me
        </DefaultButton>
    </div>
  )
}

export default DefaultButtonWrapper
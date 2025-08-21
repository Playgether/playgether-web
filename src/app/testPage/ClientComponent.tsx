"use client"
import React from 'react'
import DefaultButtonWrapper from './DefaultButtonWrapper'


type ClientComponentProps = {
  children: (someText: string) => React.ReactNode;
};


function ClientComponent({ children }: ClientComponentProps) {

  const someText = 'This is a client component text prop'
  

  return (
    <div className='h-[400px] w-[400px] gap-4 bg-blue-300 text-black-300 flex justify-center items-center flex-col p-4'>
        <p>This is a client component</p>
        <DefaultButtonWrapper text='Click Me from Client Component' />
        {children(someText)}
    </div>
  )
}

export default ClientComponent
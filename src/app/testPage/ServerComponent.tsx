import React from 'react'
import DefaultButtonWrapper from './DefaultButtonWrapper'

function ServerComponent(props:any) {
   const printFromTheServer = async() => {
    "use server"
    console.log(props.someText);
   }
  return (
    <div className='h-[300px] w-[300px] bg-green-300 text-black-300 flex justify-center items-center flex-col gap-4'>
        <p>
            This is a server component.
        </p>
        <DefaultButtonWrapper func={printFromTheServer} />
    </div>
  )
}

export default ServerComponent
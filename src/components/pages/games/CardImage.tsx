import React from 'react'
import Image, { ImageProps } from 'next/image'

/** Este componente é responsável por redenzar as imagens dos jogos */
export default function CardImage(props: ImageProps ) {
  return (
    <Image width={0} height={0} sizes='100vw' quality={100} className='h-auto w-full object-contain rounded-sm transition-transform duration-300 ease-in-out transform hover:scale-110' {...props}/>
  )
}

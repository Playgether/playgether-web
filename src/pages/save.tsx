import '../app/globals.css'

export default function Test() {
  return (
    <div className='container h-screen w-screen'>
      <div className='h-5/6 w-screen bg-cover bg-center bg-white '> 
      <video src='../img/videotest.webm'></video>  
      </div>
      <div className='h-1/6 w-screen grid grid-cols-3 shadow-md gap-0'>
        <div className='w-screen bg-gradient-to-b from-gray-500 via-gray-200 to-white  col-span-3'></div>
      </div>
      <div className='h-3/6 w-screen shadow-md bg-gradient-to-b from-white to-gray-300'>
        <div>
          <h1 className='text-center text-blue-500 text-6xl font-bold '>Quem Somos ?</h1>
        </div>
        <div className='h-4/6 align-middle'>
            <p className='text-center p-8 m-8 font-semibold'>Nós somos uma rede social que conecta gamers de todo o
            mundo. Aqui, você grava sua trajetória gamer e pode
            compartilhar com seus amigos todas suas conquistas do jogo
            que você joga. Além disso, a nossa plataforma fornece
            diversos recusos para quem joga, como criação de clãs,
            comunidades, threads, conquistas para os games, eventos
            exclusivos, atualizações e muito mais.</p> 
        </div>
      </div>
      <div className='h-4/6 w-screen grid grid-cols-3 shadow-md gap-0 pt-2'>
        <div className='h-full bg-gray-200 col-span-2 bg-gradient-to-b from-gray-100 to-gray-100'></div>
        <div className='h-full bg-orange-400 col-span-1 bg-gradient-to-b from-orange-400 to-gray-200 border-solid border-4 border-light-orange-500'></div>
      </div>
      <div className='h-1/6 w-screen grid grid-cols-3 shadow-md gap-0'>
        <div className='w-screen bg-gradient-to-b from-gray-100 via-orange-400 to-orange-500 bg-gray-200 col-span-3'></div>
      </div>
      <div className='h-3/6 w-screen bg-orange-500'>
        <p className='text-center'>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Unde sapiente numquam maxime pariatur! Optio deleniti delectus aspernatur consectetur repellat alias repellendus, dolorem consequuntur odio, iusto illo eos excepturi! Dignissimos, ipsum!</p>
      </div>
      <div className='h-1/6 w-screen bg-orange-500'>

      </div>
      <div className='bg-coolGray-300 w-screen h-5/6 grid grid-rows-2 gap-5 py-5'>
        <div className='w-screen bg-blue-500  '></div>
        <div className='w-screen bg-blue-500 '></div>
      </div>
      <footer className='w-screen h-3/6 bg-purple-600 bg'>

      </footer>
    </div>
  )
}

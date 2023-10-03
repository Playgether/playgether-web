'use client';

import OrangeButton from '../../components/elements/OrangeButton';
import '../globals.css'
import { useState, Suspense} from 'react';
import { PostProps } from '../../services/getPosts';
import { useAuthContext } from '../../context/AuthContext';
import {  getNotificationsProps } from '../../services/getNotifications';
import { SlideProps } from '../../components/layouts/Slider';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { useResource } from '../../components/custom_hooks/useResource';
import { FeedProps, getFeed } from '../../services/getFeed';



export const medias = [
  {
      "id": 20,
      "media_file": "http://127.0.0.1:8000/media/posts/images/a4741d36-d9e5-4094-ac24-29a899b4bd902023-08-23_205215.216704.png",
      "position": 1,
      "media_type": "image",
      "post": 1
  },
  {
      "id": 21,
      "media_file": "http://127.0.0.1:8000/media/posts/images/93450e18-ecca-4692-a0cb-3b7e3c431c482023-08-23_205230.228097.png",
      "position": 2,
      "media_type": "image",
      "post": 1
  },
  {
      "id": 22,
      "media_file": "http://127.0.0.1:8000/media/posts/videos/6450db7b-16df-4a38-bde7-3abc8aaa931a2023-08-23_205238.102795.mp4",
      "position": 3,
      "media_type": "video",
      "post": 1
  },
  {
    "id": 21,
    "media_file": "http://127.0.0.1:8000/media/posts/images/3833950b-d14b-401e-a1db-d6164008e6522023-08-28_211624.251170.jpg",
    "position": 2,
    "media_type": "image",
    "post": 1
},
{
  "id": 21,
  "media_file": "http://127.0.0.1:8000/media/posts/images/2f750460-62e8-4ce5-91b8-890e42fa56c42023-08-28_211650.023498.jpg",
  "position": 2,
  "media_type": "image",
  "post": 1
},
{
  "id": 21,
  "media_file": "http://127.0.0.1:8000/media/posts/videos/546ac583-a0bd-4d89-858a-eecc37ff0f152023-08-28_220837.384858.mp4",
  "position": 2,
  "media_type": "video",
  "post": 1
},
]

export default function Page() {

  const settings: SlideProps = {
    navigation:true,
    slidesPerView: 1,
    pagination: {
      clickable:true,
    },
  }

  const [userId, setUserId] = useState ('')
  const [posts, setPosts] = useState<PostProps[]>([])
  const { user, login, logout, authTokens } = useAuthContext();
  const [notifications, setNotifications] = useState<getNotificationsProps[]>([]);
  const { resources } = useResource<FeedProps[]>(() => getFeed(authTokens, user?.user_id));


  const handleTest = () => {
    console.log(user?.username);
  }


  const TestButton = () => {
    console.log('sucess')
  }


  return (
    <>
    <div className='bg-black-400 h-full w-full flex items-center '>
      <div className='relative w-64 m-10 flex items-center group h-32'>
        <div className='group-hover:opacity-100 opacity-75 absolute transition duration-1000 group-hover:duration-200 -inset-1 bg-pink-600 w-full blur-sm rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 animate-moveRight'></div>
        <button className='h-full leading-none text-white-300 bg-black-400 relative w-full group-hover:text-white-500 transition duration-200'>TEST PARA O TEXTO LEADING

        </button>
      </div>


        <div className=''>
            {/* <div className='w-full bg-red-300 text-black-400 whitespace-nowrap animate-slideLeft'>
              <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum</p>
            </div> */}
            <div>
              <button onClick={handleTest} className='text-black-400'>TESTE</button>
              <h2 className='text-black-400'>Context</h2>
              <Suspense fallback={<p>Carregando...</p>}>
                {user && <p className='text-black-400'>{user?.username}</p>}
              </Suspense>
              <Suspense fallback={<p>Carregando...</p>}>
                <p className='text-black-400'>{user?.username}</p>
              </Suspense>
              <button onClick={logout} className='text-black-400'>Click</button>
            </div>
            <input type='search' placeholder='ID' className="text-black-400 bg-white-200 bg-opacity-10 w-full h-full rounded-lg focus:outline-none " onChange={(e) => setUserId(e.target.value)}></input>
            <div>
              <OrangeButton onClick={() => TestButton()} className='text-md py-4 px-6'>
                CLICK TEST
              </OrangeButton>
            </div>

            <div className='flex flex-col space-y-2'>         
                {posts.map((post) => (
                  <div key={post.id}>
                    <h1></h1>
                    <h1>{post.timestamp}</h1>
                    <h1>{post.quantity_visualization}</h1>
                    <h1>{post.quantity_comment}</h1>
                    <h1>{post.quantity_likes}</h1>
                    <h1>{post.quantity_reposts}</h1>
                    <h1>{post.comment}</h1>
                    <h1>{post.has_post_media}</h1>
                  </div>
                ))}  
                {/* <div>
                    {authTokens && notifications.map((notification) => (
                        <p key={notification.id} className="text-black-200">{notification.message}</p>
                    ))}
                </div> */}
            </div>
            {/* <Slider settings={settings}>
              <Slide>
                <div>
                    <h1>Test</h1>
                </div>
              </Slide>
              <Slide>
                <div>
                    <h1>Test</h1>
                </div>
              </Slide>
              <Slide>
                <div>
                    <h1>Test</h1>
                </div>
              </Slide>
              <Slide>
                <div>
                    <h1>Test</h1>
                </div>
              </Slide>
            </Slider> */}
        </div>
        <div className='w-4/6 bg-green-200'>
            <p>TESTE</p>
        </div>
      </div>
    </>
  )
}


import Image from 'next/image'
import { Inter } from 'next/font/google'
import '../app/globals.css'
import { useState } from 'react';
import Button from '../components/elements/Button';
import { getPosts } from '../services/getPosts';
import ReactTimeAgo from 'react-time-ago';
import TimeAgo from "javascript-time-ago"
import pt from "javascript-time-ago/locale/pt.json"
import ru from "javascript-time-ago/locale/ru.json"
import { PostProps } from '../services/getPosts';

TimeAgo.addDefaultLocale(pt);
TimeAgo.addLocale(ru);

const inter = Inter({ subsets: ['latin'] })

export default function Page() {

  const [userId, setUserId] = useState ('')
  const [posts, setPosts] = useState<PostProps[]>([])

  const handleButtonClick = async () => {
    try{

      const response = await getPosts(userId);
      setPosts(response);

    } catch {
      "sla"
    }

  }

  return (
    <div>
        <input type='search' placeholder='ID' className="bg-white-200 bg-opacity-10 w-full h-full rounded-lg focus:outline-none text-black-400" onChange={(e) => setUserId(e.target.value)}></input>
        <Button
                onClick={handleButtonClick}
                pxValue={8}
                pyValue={4}
                extraClassName={'inline-block w-full leading-none shadow'}          
                >
                LOGAR
        </Button>
        <div className='flex flex-col space-y-2'>         
            {posts.map((post) => (
              <div key={post.id}>
                <h1><ReactTimeAgo date={post.timestamp} locale='en-US' /></h1>
                <h1>{post.timestamp}</h1>
                <h1>{post.quantity_visualization}</h1>
                <h1>{post.quantity_comment}</h1>
                <h1>{post.quantity_likes}</h1>
                <h1>{post.quantity_reposts}</h1>
                <h1>{post.comment}</h1>
                <h1>{post.has_post_media}</h1>
              </div>
            ))}   
        </div>
    </div>
  )
}


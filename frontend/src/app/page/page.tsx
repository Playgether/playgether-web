'use client';


import Image from 'next/image'
import { Inter } from 'next/font/google'
import '../globals.css'
import { useState, useContext, Suspense, useEffect } from 'react';
import Button from '../../components/elements/Button';
import { getPosts } from '../../services/getPosts';
import ReactTimeAgo from 'react-time-ago';
import TimeAgo from "javascript-time-ago"
import pt from "javascript-time-ago/locale/pt.json"
import ru from "javascript-time-ago/locale/ru.json"
import { PostProps } from '../../services/getPosts';
// import { AuthContext } from '../context/AuthContext';
import { useAuthContext } from '../../context/AuthContext';
import { AppProvider } from '../../context';
import { getNotifications, getNotificationsProps } from '../../services/getNotifications';

TimeAgo.addDefaultLocale(pt);
TimeAgo.addLocale(ru);



export default function Page() {

  const [userId, setUserId] = useState ('')
  const [posts, setPosts] = useState<PostProps[]>([])
  const { user, login, logout, authTokens } = useAuthContext();
  const [notifications, setNotifications] = useState<getNotificationsProps[]>([]);

  const handleTest = () => {
    console.log(user?.username);
  }

  const handleNotifications = async () => {
    if (authTokens) {
      const response = await getNotifications(authTokens, user);
      setNotifications(response);
    }
  };

  useEffect(() => {
    handleNotifications();
  }, [authTokens, user]);


  const handleButtonClick = async () => {
    try{

      const response = await getPosts(userId);
      setPosts(response);

    } catch {
      "sla"
    }

  }

  return (
    <>
      <div>
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
              <div>
                  {authTokens && notifications.map((notification) => (
                      <p key={notification.id} className="text-black-200">{notification.message}</p>
                  ))}
              </div>
          </div>
      </div>
    </>
  )
}


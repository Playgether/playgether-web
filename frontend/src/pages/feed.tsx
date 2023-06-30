import '../app/globals.css'
import Button from '../components/elements/Button'
import ImageComponent from '../components/elements/ImageComponent';
import HeaderFeed from '../components/pages/feed/HeaderFeed';
import GlobalChat from '../components/pages/feed/GlobalChat';
import ContentFeed from '../components/pages/feed/ContentFeed';


export default function Feed() {
  return (
    <div className='h-screen w-screen bg-white-300 flex flex-col overflow-x-hidden'>

      <HeaderFeed />
      <GlobalChat />
      <ContentFeed />

    </div>
  )
}

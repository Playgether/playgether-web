import BaseLayout from '../../components/layouts/BaseLayout';
import ContentFeed from '../../components/pages/feed/DesktopFeed/MultUseComponents/ContentFeed';
import { ResponsiveContainer } from '../../components/pages/feed/ResponsiveFeed/Container';


export default async function Feed() {
  return (
    <BaseLayout>
      <div className='hidden lg:flex flex-col h-full w-full'>
        <ContentFeed />
      </div> 
      <div className='lg:hidden h-full w-full'>
        <ResponsiveContainer />
      </div> 
    </BaseLayout>
    )
}

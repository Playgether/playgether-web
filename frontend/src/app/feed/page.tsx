import BaseLayout from '../../components/layouts/BaseLayout';
import ContentFeed from '../../components/pages/feed/ContentFeed';


export default async function Feed() {
  return (
    <BaseLayout>  
      <ContentFeed />
    </BaseLayout>
    )
}

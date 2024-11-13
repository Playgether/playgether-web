import BaseLayout from '../../components/layouts/BaseLayout';
import { FeedFetchComponent } from '../../components/pages/feed/CommonComponents/FeedFetchComponent';
import { FeedContextProvider } from '../../context/FeedContext';


export default async function Feed() {

  return (
    <BaseLayout>
      <FeedContextProvider>
        <FeedFetchComponent />
      </FeedContextProvider>
    </BaseLayout>
    )
}

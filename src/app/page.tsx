import '@/app/globals.css'
import Video from '../components/pages/index/Video';
import Footer from '../components/pages/index/Footer';
import ContentSection from '../components/pages/index/ContentSection';

export default function Initial() {
  return (
    <div className="flex w-screen">
        <section className="relative h-[100vh] shrink-0 grid grid-rows-3 w-full">
            <Video />
            <ContentSection />
            <Footer />
        </section>
    </div>
  )
}
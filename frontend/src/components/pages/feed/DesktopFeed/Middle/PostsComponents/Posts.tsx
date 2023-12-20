import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Scrollbar, A11y } from 'swiper/modules';
import Image from "next/legacy/image";
import { twJoin, twMerge } from 'tailwind-merge';
import { HTMLAttributes, useEffect, useRef} from 'react';
import { PostMedias } from '../../../../../../services/getFeed';


interface PostsProps extends HTMLAttributes<HTMLDivElement>{
    media: PostMedias[], 
    onExpand? : (...props: any[]) => void, 
    postsSize?: string
    setSlideIndex?: (slideIndex: number) => void
    slideIndex?:number 
}

const Posts = ({ media, slideIndex=0, onExpand, setSlideIndex, postsSize="h-full", ...rest }: PostsProps) => {
    const volumeRef = useRef<HTMLVideoElement | null> (null)

    const handleSlideChange = (swiper) => {
        const videos = document.querySelectorAll('video');
        videos.forEach(video => {
            if (!video.paused) {
                video.pause();
            }
        });
        if (setSlideIndex) {
            setSlideIndex(swiper.snapIndex)
        }
    };


    useEffect (() => {

        const currentRef = volumeRef.current;

        if (currentRef) {
            currentRef.volume = 0.2;
        }   

    }, [volumeRef])


    return (
        <>
        {media && media.length > 0 ? (
            <div className={twMerge("bg-white-200 items-center justify-center relative pt-3 cursor-pointer", rest.className)}>
            <Swiper 
                modules={[Navigation, Pagination, Scrollbar, A11y]}
                slidesPerView={1}
                navigation
                pagination={{ clickable: true, el: '.sample-slider', }}
                className=" relative h-full z-10"
                onSlideChange={handleSlideChange}
                initialSlide={slideIndex}
                >
                {media.map(item => (
                    <SwiperSlide key={item.id} className=" h-full" onClick={
                        onExpand
                    }>
          
                        {item.media_type === "image" ? (
                        <div className={twJoin("relative ", postsSize)} >
                            <Image
                                src={item.media_file}
                                alt={"TESTE"}
                                layout="fill"
                                objectFit="contain"
                            />
                        </div>
                        ) : (
                        <div className={twJoin("relative", postsSize)} >
                            <video playsInline muted autoPlay controls ref={volumeRef} className="object-contain h-full mx-auto">
                                <source src={item.media_file} type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                        </div>
                        )}
                    </SwiperSlide>
                ))}
            </Swiper>
            <div className="sample-slider swiper-pagination-bullets sample-slider-pagination"></div>
            </div>
        ) : null}
        </>
    );
};

export default Posts

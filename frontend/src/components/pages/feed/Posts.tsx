import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Scrollbar, A11y } from 'swiper/modules';
import Image from "next/legacy/image";
import { PostMedias } from '../../../services/getFeed';
import { twJoin, twMerge } from 'tailwind-merge';
import { HTMLAttributes } from 'react';

interface PostsProps extends HTMLAttributes<HTMLDivElement>{
    media: PostMedias[], 
    onExpand? : (...props) => void, 
    postsSize?: string
}

const Posts = ({ media, onExpand, postsSize="h-full", ...rest }: PostsProps) => {

    const handleSlideChange = (swiper) => {
        const videos = document.querySelectorAll('video');
        videos.forEach(video => {
            if (!video.paused) {
                video.pause();
            }
        });
    };

    return (
        <>
        {media && media.length > 0 ? (
            <div className={twMerge("bg-white-200 items-center justify-center relative pt-3 cursor-pointer", rest.className)} onClick={(event) => {onExpand && onExpand(), event.stopPropagation();}}>
            <Swiper 
                modules={[Navigation, Pagination, Scrollbar, A11y]}
                slidesPerView={1}
                navigation
                pagination={{ clickable: true, el: '.sample-slider', }}
                className=" relative h-full"
                onSlideChange={handleSlideChange}
                >
                {media.map(item => (
                    <SwiperSlide key={item.id} className="-z-1 h-full">
          
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
                            <video loop playsInline controls className="object-contain h-full mx-auto">
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

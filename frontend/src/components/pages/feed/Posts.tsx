import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Scrollbar, A11y } from 'swiper/modules';
import Image from "next/legacy/image";

const Posts = ({ media, onExpand }: {media: any, onExpand? : (...props) => void}) => {

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
            <div className="swiper-container relative pt-3 bg-white-200 h-full cursor-pointer" onClick={(event) => {onExpand && onExpand(), event.stopPropagation();}}>
            <Swiper 
                modules={[Navigation, Pagination, Scrollbar, A11y]}
                slidesPerView={1}
                navigation
                pagination={{ clickable: true, el: '.sample-slider', }}
                className="swiper-container relative h-full"
                onSlideChange={handleSlideChange}
                >
                {media.map(item => (
                    <SwiperSlide key={item.id} className="pb-5 -z-1 h-full">
          
                        {item.media_type === "image" ? (
                        <div className="h-full" >
                            <Image
                                src={item.media_file}
                                alt={"TESTE"}
                                layout="fill"
                                objectFit="contain"
                            />
                        </div>
                        ) : (
                            <video loop playsInline controls className="object-contain h-full mx-auto">
                                <source src={item.media_file} type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
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

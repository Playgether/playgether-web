import React, { ReactNode } from 'react';
import { Swiper, SwiperSlide, SwiperProps } from 'swiper/react';
import { Navigation, Pagination, A11y } from 'swiper/modules'

interface SliderProps {
    settings: SwiperProps
    children: ReactNode;
}

const Slider = ({settings, children}: SliderProps) => {

    return (
        <Swiper modules={[Navigation, Pagination, A11y]}{...settings} className='swiper swiper-pagination-bullet-active swiper-button-next swiper-slide'>
            {children}
        </Swiper>
    )
    
}

export default Slider
import React from "react";
import Image from "next/image";

const ImageComponent = ({src, width, height, alt, layout="responsive"}) => {
    
    return (
        <Image
            src={src}
            width={width}
            height={height}
            alt={alt}
            layout={layout}
        />
    );
};

export default ImageComponent
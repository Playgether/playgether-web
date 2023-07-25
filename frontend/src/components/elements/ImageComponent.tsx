import React from "react";
import Image from "next/legacy/image";

const ImageComponent = ({src, width, height, alt, layout, objectFit}) => {
    
    return (
        <Image
            src={src}
            width={width}
            height={height}
            alt={alt}
            layout={layout}
            objectFit={objectFit}
        />
    );
};

export default ImageComponent
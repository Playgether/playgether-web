import React from "react";

const Video = () => {
    return (
        <video
            autoPlay
            loop
            muted
            playsInline
            disablePictureInPicture
            className="absolute h-full object-cover -z-10 blur-sm flex w-full"
            >
            <source src="/index/background5.mp4" type="video/mp4" />
            Your browser does not support the video tag.
        </video>
    );
};

export default Video;
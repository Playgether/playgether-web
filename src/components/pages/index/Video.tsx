import React from "react";

const Video = () => {
  return (
    <video
      autoPlay
      loop
      muted
      playsInline
      disablePictureInPicture
      preload="auto"
      className="pointer-events-none absolute inset-0 h-full w-full object-cover blur-sm"
    >
      <source src="/index/Background5.mp4" type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  );
};

export default Video;

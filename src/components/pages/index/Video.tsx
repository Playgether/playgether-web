import React from "react";

const Video = () => {
  return (
    <video
      autoPlay
      loop
      muted
      playsInline
      disablePictureInPicture
      preload="metadata"
      poster="/index/Background-poster.webp"
      className="pointer-events-none absolute inset-0 h-full w-full object-cover"
    >
      <source
        src="/index/Background-1080.webm"
        type='video/webm; codecs="av01.0.08M.10"'
        media="(min-width: 768px)"
      />
      <source
        src="/index/Background-720.webm"
        type='video/webm; codecs="av01.0.05M.10"'
      />
      <source
        src="/index/Background-1080.mp4"
        type="video/mp4"
        media="(min-width: 768px)"
      />
      <source src="/index/Background-720.mp4" type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  );
};

export default Video;

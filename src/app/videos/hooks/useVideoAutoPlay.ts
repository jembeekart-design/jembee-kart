"use client";

import {
  useEffect
} from "react";

interface UseVideoAutoPlayProps {

  activeVideo: number;

}

export default function
useVideoAutoPlay({
  activeVideo
}: UseVideoAutoPlayProps) {

  useEffect(() => {

    const videos =
      document.querySelectorAll(
        "video"
      );

    videos.forEach(
      (
        video,
        index
      ) => {

        const videoElement =
          video as HTMLVideoElement;

        if (
          index ===
          activeVideo
        ) {

          videoElement
            .play()
            .catch(
              (
                error
              ) => {

                console.error(
                  error
                );
              }
            );

        } else {

          videoElement.pause();
        }
      }
    );

  }, [activeVideo]);
}

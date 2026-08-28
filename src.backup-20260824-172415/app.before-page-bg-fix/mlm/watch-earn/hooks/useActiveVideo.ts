"use client";

import {
  useEffect,
  useState
} from "react";

export default function
useActiveVideo() {

  const [
    activeVideo,
    setActiveVideo
  ] = useState(0);

  useEffect(() => {

    function handleScroll() {

      const sections =
        document.querySelectorAll(
          ".watch-video-item"
        );

      let current = 0;

      sections.forEach(
        (
          section,
          index
        ) => {

          const rect =
            section.getBoundingClientRect();

          const center =
            window.innerHeight / 2;

          if (
            rect.top <= center &&
            rect.bottom >= center
          ) {

            current =
              index;
          }
        }
      );

      setActiveVideo(
        current
      );
    }

    window.addEventListener(
      "scroll",
      handleScroll
    );

    handleScroll();

    return () => {

      window.removeEventListener(
        "scroll",
        handleScroll
      );
    };

  }, []);

  return {
    activeVideo
  };
}

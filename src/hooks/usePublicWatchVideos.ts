"use client";

import { useEffect, useState } from "react";
import { getWatchVideos, type WatchVideo } from "@/app/videos/services/watchVideos.service";

type PublicWatchVideosState = {
  videos: WatchVideo[];
  loading: boolean;
  error: string;
};

export function usePublicWatchVideos(): PublicWatchVideosState {
  const [state, setState] = useState<PublicWatchVideosState>({
    videos: [],
    loading: true,
    error: "",
  });

  useEffect(() => {
    let active = true;

    getWatchVideos()
      .then((result) => {
        if (!active) return;
        if (result.success) {
          setState({ videos: result.videos, loading: false, error: "" });
        } else {
          setState({ videos: [], loading: false, error: "वीडियो अभी लोड नहीं हो सके। Firebase connection और Firestore access जाँचें।" });
        }
      })
      .catch(() => {
        if (active) setState({ videos: [], loading: false, error: "वीडियो लोड नहीं हो सके। कृपया बाद में फिर कोशिश करें।" });
      });

    return () => {
      active = false;
    };
  }, []);

  return state;
}

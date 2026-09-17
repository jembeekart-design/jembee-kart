"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  fetchCreatorVideos,
  getCreatorInfo,
} from "@/lib/mlm/watch-earn/fetchWatchVideos";
import type {
  WatchVideo,
  CreatorInfo,
} from "@/lib/mlm/watch-earn/fetchWatchVideos";
import { ArrowLeft } from "lucide-react";
import { db } from "@/firebase/config";
import { doc, getDoc } from "firebase/firestore";

export default function PublicUploaderPage() {
  const params = useParams();
  const creatorId = params.creatorId as string;
  const router = useRouter();

  const [creatorInfo, setCreatorInfo] =
    useState<CreatorInfo | null>(null);
  const [videos, setVideos] =
    useState<WatchVideo[]>([]);
  const [followers, setFollowers] =
    useState(0);
  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!creatorId) return;

      const userSnap = await getDoc(
        doc(db, "users", creatorId)
      );

      if (userSnap.exists()) {
        const data = userSnap.data();

        setCreatorInfo({
          documentId: creatorId,
          displayName:
            typeof data.name === "string"
              ? data.name
              : typeof data.displayName === "string"
                ? data.displayName
                : undefined,
          username:
            typeof data.username === "string"
              ? data.username
              : typeof data.userName === "string"
                ? data.userName
                : undefined,
          photoURL:
            typeof data.photoUrl === "string"
              ? data.photoUrl
              : typeof data.photoURL === "string"
                ? data.photoURL
                : undefined,
        });

        setFollowers(
          typeof data.followersCount === "number"
            ? data.followersCount
            : 0
        );
      }

      const result =
        await fetchCreatorVideos(creatorId);

      if (result.success) {
        setVideos(result.videos);

        // If the users document has no username, use the
        // existing username/displayName already stored on the Shorts video.
        if (!userSnap.exists() || !creatorInfo?.username) {
          const firstVideo = result.videos[0];

          if (firstVideo) {
            setCreatorInfo((prev) => ({
              documentId: creatorId,
              displayName:
                prev?.displayName ||
                firstVideo.displayName ||
                firstVideo.username ||
                undefined,
              username:
                prev?.username ||
                firstVideo.username ||
                firstVideo.displayName ||
                undefined,
              photoURL:
                prev?.photoURL ||
                firstVideo.photoURL ||
                undefined,
            }));
          }
        }
      }

      setLoading(false);
    }

    fetchData();
  }, [creatorId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-white p-4 text-gray-900">
        Loading...
      </main>
    );
  }

  const rawUsername =
    creatorInfo?.username?.trim() ||
    creatorInfo?.displayName?.trim() ||
    "User";

  const username =
    rawUsername.includes("@")
      ? (creatorInfo?.displayName?.trim() || "User")
      : rawUsername;

  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 px-4 py-3 backdrop-blur">
        <div className="flex items-center justify-center">
          <h1 className="text-xl font-extrabold tracking-tight text-teal-600">
            Jembee Shorts
          </h1>
        </div>
      </header>

      {/* CREATOR INFO */}
      <section className="px-4 pb-5 pt-6">
        <button
          onClick={() => router.back()}
          className="mb-5 flex items-center gap-2 text-sm font-medium text-gray-500"
        >
          <ArrowLeft size={17} />
          Back
        </button>

        <div className="text-center">
          <h2 className="text-2xl font-extrabold text-gray-900">
            @{username}
          </h2>

          <div className="mt-2 flex items-center justify-center gap-2 text-sm text-gray-500">
            <span>
              {followers} Followers
            </span>

            <span>•</span>

            <span>
              {videos.length} Videos
            </span>
          </div>
        </div>
      </section>

      {/* VIDEOS */}
      <section className="border-t border-gray-100">
        {videos.length === 0 ? (
          <div className="px-4 py-16 text-center text-gray-500">
            No Shorts uploaded yet.
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1 bg-gray-100">
            {videos.map((video) => (
              <button
                key={video.id}
                type="button"
                onClick={() =>
                  router.push(
                    `/mlm/watch-earn/original/${video.id}`
                  )
                }
                className="aspect-[9/16] overflow-hidden bg-gray-200"
              >
                {video.thumbnail ? (
                  <img
                    src={video.thumbnail}
                    alt="Short thumbnail"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                    No thumbnail
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

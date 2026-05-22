"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp
} from "firebase/firestore";

import {
  Radio,
  Trash2,
  Video,
  Save,
  Link2,
  Clock3,
  User2
} from "lucide-react";

import { db } from "@/firebase/config";

interface LiveStream {
  id?: string;
  title: string;
  streamer: string;
  streamUrl: string;
  startTime: string;
  createdAt?: any;
}

export default function LiveStreamPage() {

  const [title, setTitle] =
    useState("");

  const [streamer, setStreamer] =
    useState("");

  const [streamUrl, setStreamUrl] =
    useState("");

  const [startTime, setStartTime] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [streams, setStreams] =
    useState<LiveStream[]>([]);

  useEffect(() => {

    const unsubscribe =
      onSnapshot(
        collection(
          db,
          "live_streams"
        ),
        (snapshot) => {

          const data:
            LiveStream[] = [];

          snapshot.forEach((doc) => {

            data.push({
              id: doc.id,
              ...doc.data()
            } as LiveStream);

          });

          setStreams(data);

          setLoading(false);

        }
      );

    return () =>
      unsubscribe();

  }, []);

  async function createStream() {

    if (
      !title ||
      !streamer ||
      !streamUrl ||
      !startTime
    ) {

      alert(
        "Fill all fields"
      );

      return;

    }

    try {

      setSaving(true);

      await addDoc(
        collection(
          db,
          "live_streams"
        ),
        {
          title,
          streamer,
          streamUrl,
          startTime,
          createdAt:
            serverTimestamp()
        }
      );

      setTitle("");

      setStreamer("");

      setStreamUrl("");

      setStartTime("");

      alert(
        "Live Stream Added"
      );

    } catch (error) {

      console.log(error);

    } finally {

      setSaving(false);

    }
  }

  async function deleteStream(
    id: string
  ) {

    try {

      await deleteDoc(
        doc(
          db,
          "live_streams",
          id
        )
      );

    } catch (error) {

      console.log(error);

    }
  }

  if (loading) {

    return (

      <div className="flex min-h-screen items-center justify-center bg-black text-white">

        Loading...

      </div>

    );
  }

  return (

    <main className="min-h-screen bg-[#0b0b0b] p-4 text-white">

      {/* HEADER */}

      <div className="mb-8 flex items-center gap-4">

        <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-red-500">

          <Radio size={30} />

        </div>

        <div>

          <h1 className="text-3xl font-black">
            Live Stream Manager
          </h1>

          <p className="mt-1 text-sm text-gray-400">
            Manage live shopping streams
          </p>

        </div>

      </div>

      {/* CREATE STREAM */}

      <div className="rounded-[30px] bg-[#151515] p-5">

        <h2 className="mb-5 text-2xl font-black">

          Create Live Stream

        </h2>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

          <div>

            <label className="mb-2 block text-sm text-gray-400">

              Stream Title

            </label>

            <div className="flex items-center gap-3 rounded-2xl bg-black px-4">

              <Video size={18} />

              <input
                type="text"
                value={title}
                onChange={(e) =>
                  setTitle(
                    e.target.value
                  )
                }
                className="w-full bg-transparent py-4 outline-none"
              />

            </div>

          </div>

          <div>

            <label className="mb-2 block text-sm text-gray-400">

              Streamer Name

            </label>

            <div className="flex items-center gap-3 rounded-2xl bg-black px-4">

              <User2 size={18} />

              <input
                type="text"
                value={streamer}
                onChange={(e) =>
                  setStreamer(
                    e.target.value
                  )
                }
                className="w-full bg-transparent py-4 outline-none"
              />

            </div>

          </div>

          <div>

            <label className="mb-2 block text-sm text-gray-400">

              Stream URL

            </label>

            <div className="flex items-center gap-3 rounded-2xl bg-black px-4">

              <Link2 size={18} />

              <input
                type="text"
                value={streamUrl}
                onChange={(e) =>
                  setStreamUrl(
                    e.target.value
                  )
                }
                className="w-full bg-transparent py-4 outline-none"
              />

            </div>

          </div>

          <div>

            <label className="mb-2 block text-sm text-gray-400">

              Start Time

            </label>

            <div className="flex items-center gap-3 rounded-2xl bg-black px-4">

              <Clock3 size={18} />

              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) =>
                  setStartTime(
                    e.target.value
                  )
                }
                className="w-full bg-transparent py-4 outline-none"
              />

            </div>

          </div>

        </div>

        <button
          onClick={
            createStream
          }
          disabled={saving}
          className="mt-6 flex items-center gap-2 rounded-2xl bg-red-500 px-5 py-4 font-bold"
        >

          <Save size={18} />

          {saving
            ? "Creating..."
            : "Create Stream"}

        </button>

      </div>

      {/* STREAMS */}

      <div className="mt-6 space-y-5">

        {streams.length === 0 && (

          <div className="rounded-[30px] bg-[#151515] p-10 text-center">

            No Live Streams Found

          </div>

        )}

        {streams.map(
          (stream) => (

            <div
              key={stream.id}
              className="rounded-[30px] bg-[#151515] p-5"
            >

              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                <div>

                  <h2 className="text-3xl font-black text-red-400">

                    {stream.title}

                  </h2>

                  <p className="mt-2 text-gray-400">

                    Streamer:
                    {" "}
                    {stream.streamer}

                  </p>

                  <p className="mt-1 text-gray-400 break-all">

                    URL:
                    {" "}
                    {stream.streamUrl}

                  </p>

                  <p className="mt-1 text-gray-400">

                    Start:
                    {" "}
                    {stream.startTime}

                  </p>

                </div>

                <button
                  onClick={() =>
                    deleteStream(
                      stream.id!
                    )
                  }
                  className="flex items-center gap-2 rounded-2xl bg-red-500 px-5 py-3 font-bold"
                >

                  <Trash2 size={18} />

                  Delete

                </button>

              </div>

            </div>

          )
        )}

      </div>

    </main>

  );
}

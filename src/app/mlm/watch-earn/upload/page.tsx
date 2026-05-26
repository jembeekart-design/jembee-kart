"use client";

import {
  useState
} from "react";

import {
  Upload,
  Loader2,
  Coins,
  Music2
} from "lucide-react";

import {
  uploadWatchVideo
} from "@/lib/mlm/watch-earn/uploadWatchVideo";

export default function
UploadWatchVideoPage() {

  const [
    file,
    setFile
  ] = useState<File | null>(
    null
  );

  const [
    loading,
    setLoading
  ] = useState(false);

  const [
    caption,
    setCaption
  ] = useState("");

  const [
    hashtags,
    setHashtags
  ] = useState("");

  const [
    music,
    setMusic
  ] = useState("");

  const [
    coins,
    setCoins
  ] = useState(10);

  async function
  handleUpload() {

    try {

      if (!file) {

        alert(
          "Select video first"
        );

        return;
      }

      setLoading(true);

      const result =
        await uploadWatchVideo({
          file,

          userId:
            "demo-user-id",

          username:
            "JembeeKart",

          caption,

          hashtags:
            hashtags
              .split(","),

          music,

          coins
        });

      if (
        result.success
      ) {

        alert(
          "Video uploaded successfully"
        );

        setCaption("");

        setHashtags("");

        setMusic("");

        setCoins(10);

        setFile(null);

      } else {

        alert(
          "Upload failed"
        );
      }

    } catch (error) {

      console.error(
        error
      );

    } finally {

      setLoading(false);
    }
  }

  return (

    <main
      className="
        min-h-screen
        bg-[#0f0f12]
        px-4
        py-6
      "
    >

      {/* HEADER */}

      <div
        className="
          mb-8
        "
      >

        <h1
          className="
            text-3xl
            font-black
            text-white
          "
        >

          Upload Watch Video

        </h1>

        <p
          className="
            mt-2
            text-sm
            text-gray-400
          "
        >

          Upload videos & earn from views

        </p>

      </div>

      {/* FORM */}

      <div
        className="
          space-y-5
        "
      >

        {/* FILE */}

        <label
          className="
            flex
            cursor-pointer
            flex-col
            items-center
            justify-center
            rounded-3xl
            border-2
            border-dashed
            border-white/10
            bg-white/5
            px-5
            py-12
            text-center
          "
        >

          <Upload
            size={42}
            className="
              text-violet-400
            "
          />

          <p
            className="
              mt-4
              text-lg
              font-black
              text-white
            "
          >

            Upload Video

          </p>

          <p
            className="
              mt-2
              text-sm
              text-gray-400
            "
          >

            MP4, MOV supported

          </p>

          <input
            type="file"

            accept="video/*"

            hidden

            onChange={(e) => {

              const selected =
                e.target.files?.[0];

              if (
                selected
              ) {

                setFile(
                  selected
                );
              }
            }}
          />

        </label>

        {/* FILE NAME */}

        {file && (

          <div
            className="
              rounded-2xl
              bg-violet-500/10
              px-4
              py-4
              text-sm
              font-bold
              text-violet-300
            "
          >

            {file.name}

          </div>

        )}

        {/* CAPTION */}

        <textarea
          value={caption}

          onChange={(e) =>
            setCaption(
              e.target.value
            )
          }

          placeholder="Write caption..."

          className="
            h-32
            w-full
            rounded-3xl
            border
            border-white/10
            bg-white/5
            p-5
            text-white
            outline-none
          "
        />

        {/* HASHTAGS */}

        <input
          value={hashtags}

          onChange={(e) =>
            setHashtags(
              e.target.value
            )
          }

          placeholder="fashion,viral,trending"

          className="
            w-full
            rounded-2xl
            border
            border-white/10
            bg-white/5
            px-5
            py-4
            text-white
            outline-none
          "
        />

        {/* MUSIC */}

        <div
          className="
            flex
            items-center
            gap-3
            rounded-2xl
            border
            border-white/10
            bg-white/5
            px-5
            py-4
          "
        >

          <Music2
            size={20}
            className="
              text-pink-400
            "
          />

          <input
            value={music}

            onChange={(e) =>
              setMusic(
                e.target.value
              )
            }

            placeholder="Music name"

            className="
              flex-1
              bg-transparent
              text-white
              outline-none
            "
          />

        </div>

        {/* COINS */}

        <div
          className="
            flex
            items-center
            gap-3
            rounded-2xl
            border
            border-white/10
            bg-white/5
            px-5
            py-4
          "
        >

          <Coins
            size={20}
            className="
              text-yellow-300
            "
          />

          <input
            type="number"

            value={coins}

            onChange={(e) =>
              setCoins(
                Number(
                  e.target.value
                )
              )
            }

            className="
              flex-1
              bg-transparent
              text-white
              outline-none
            "
          />

        </div>

        {/* BUTTON */}

        <button
          onClick={handleUpload}

          disabled={loading}

          className="
            flex
            w-full
            items-center
            justify-center
            gap-3
            rounded-3xl
            bg-gradient-to-r
            from-violet-600
            to-fuchsia-500
            px-5
            py-4
            text-lg
            font-black
            text-white
          "
        >

          {loading ? (

            <Loader2
              size={22}
              className="
                animate-spin
              "
            />

          ) : (

            <Upload
              size={22}
            />

          )}

          {loading
            ? "Uploading..."
            : "Upload Video"}

        </button>

      </div>

    </main>
  );
}

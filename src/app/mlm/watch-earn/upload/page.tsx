"use client";

import {
  useState
} from "react";

import {
  Upload,
  Loader2,
  Music2,
  BadgeCheck,
  ShieldCheck
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
              .split(",")

              .map(
                (tag) =>
                  tag.trim()
              )

              .filter(Boolean),

          music
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

        setFile(null);

      } else {

        alert(
          result.message ||
          "Upload failed"
        );
      }

    } catch (error) {

      console.error(
        error
      );

      alert(
        "Something went wrong"
      );

    } finally {

      setLoading(false);
    }
  }

  return (

    <main
      className="
        min-h-screen
        bg-[#0a0a0f]
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

        <div
          className="
            flex
            items-center
            gap-3
          "
        >

          <div
            className="
              flex
              h-14
              w-14
              items-center
              justify-center
              rounded-3xl
              bg-[var(--secondary-color)]/20
            "
          >

            <Upload
              size={28}
              className="
                text-violet-400
              "
            />

          </div>

          <div>

            <h1
              className="
                text-3xl
                font-black
                text-[var(--button-text-color)]
              "
            >

              Upload Video

            </h1>

            <p
              className="
                mt-1
                text-sm
                text-gray-400
              "
            >

              Upload videos for Watch & Earn

            </p>

          </div>

        </div>

      </div>

      {/* INFO BOX */}

      <div
        className="
          mb-6
          rounded-3xl
          border
          border-violet-500/20
          bg-[var(--secondary-color)]/10
          p-5
        "
      >

        <div
          className="
            flex
            items-start
            gap-4
          "
        >

          <ShieldCheck
            size={24}
            className="
              mt-1
              text-violet-300
            "
          />

          <div>

            <h2
              className="
                text-lg
                font-black
                text-[var(--button-text-color)]
              "
            >

              Video Rules

            </h2>

            <ul
              className="
                mt-3
                space-y-2
                text-sm
                text-violet-100
              "
            >

              <li>
                • Only original videos allowed
              </li>

              <li>
                • Spam & copied videos rejected
              </li>

              <li>
                • Admin automatically sets rewards
              </li>

              <li>
                • Viral videos may get featured
              </li>

            </ul>

          </div>

        </div>

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
            rounded-[32px]
            border-2
            border-dashed
            border-white/10
            bg-gradient-to-b
            from-white/5
            to-white/[0.02]
            px-5
            py-14
            text-center
          "
        >

          <div
            className="
              flex
              h-20
              w-20
              items-center
              justify-center
              rounded-full
              bg-[var(--secondary-color)]/20
            "
          >

            <Upload
              size={42}
              className="
                text-violet-400
              "
            />

          </div>

          <p
            className="
              mt-5
              text-2xl
              font-black
              text-[var(--button-text-color)]
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
              flex
              items-center
              justify-between
              rounded-3xl
              border
              border-violet-500/20
              bg-[var(--secondary-color)]/10
              px-5
              py-5
            "
          >

            <div>

              <p
                className="
                  text-xs
                  font-bold
                  uppercase
                  tracking-wider
                  text-violet-300
                "
              >

                Selected Video

              </p>

              <p
                className="
                  mt-2
                  text-sm
                  font-black
                  text-[var(--button-text-color)]
                "
              >

                {file.name}

              </p>

            </div>

            <BadgeCheck
              size={24}
              className="
                text-violet-300
              "
            />

          </div>

        )}

        {/* CAPTION */}

        <div
          className="
            rounded-3xl
            border
            border-white/10
            bg-[var(--card-color)]/5
            p-5
          "
        >

          <p
            className="
              mb-3
              text-sm
              font-black
              text-[var(--button-text-color)]
            "
          >

            Caption

          </p>

          <textarea
            value={caption}

            onChange={(e) =>
              setCaption(
                e.target.value
              )
            }

            placeholder="Write your video caption..."

            className="
              h-32
              w-full
              resize-none
              bg-transparent
              text-[var(--button-text-color)]
              outline-none
              placeholder:text-[var(--muted-text-color)]
            "
          />

        </div>

        {/* HASHTAGS */}

        <div
          className="
            rounded-3xl
            border
            border-white/10
            bg-[var(--card-color)]/5
            p-5
          "
        >

          <p
            className="
              mb-3
              text-sm
              font-black
              text-[var(--button-text-color)]
            "
          >

            Hashtags

          </p>

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
              bg-transparent
              text-[var(--button-text-color)]
              outline-none
              placeholder:text-[var(--muted-text-color)]
            "
          />

        </div>

        {/* MUSIC */}

        <div
          className="
            flex
            items-center
            gap-4
            rounded-3xl
            border
            border-white/10
            bg-[var(--card-color)]/5
            px-5
            py-5
          "
        >

          <div
            className="
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-full
              bg-pink-500/20
            "
          >

            <Music2
              size={22}
              className="
                text-pink-400
              "
            />

          </div>

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
              text-[var(--button-text-color)]
              outline-none
              placeholder:text-[var(--muted-text-color)]
            "
          />

        </div>

        {/* AUTO REWARD */}

        <div
          className="
            rounded-3xl
            border
            border-yellow-500/20
            bg-[var(--warning-color)]/10
            p-5
          "
        >

          <p
            className="
              text-sm
              font-black
              text-yellow-300
            "
          >

            Rewards are automatically managed by JembeeKart Admin.

          </p>

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
            rounded-[30px]
            bg-gradient-to-r
            from-violet-600
            to-fuchsia-500
            px-5
            py-5
            text-lg
            font-black
            text-[var(--button-text-color)]
            shadow-2xl
            shadow-violet-500/20
          "
        >

          {loading ? (

            <Loader2
              size={24}
              className="
                animate-spin
              "
            />

          ) : (

            <Upload
              size={24}
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

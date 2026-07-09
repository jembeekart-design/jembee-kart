"use client";

import {
  useEffect,
  useState
} from "react";

import {
  Camera,
  Mic,
  Bell,
  Play,
  ShieldCheck
} from "lucide-react";

export default function
PermissionPage() {

  const [
    cameraAllowed,
    setCameraAllowed
  ] = useState(false);

  const [
    micAllowed,
    setMicAllowed
  ] = useState(false);

  const [
    notificationAllowed,
    setNotificationAllowed
  ] = useState(false);

  const [
    loading,
    setLoading
  ] = useState(false);

  useEffect(() => {

    checkPermissions();

  }, []);

  async function
  checkPermissions() {

    try {

      /* CAMERA */

      const camera =
        await navigator.permissions.query({
          name: "camera" as PermissionName
        });

      setCameraAllowed(
        camera.state === "granted"
      );

      /* MICROPHONE */

      const mic =
        await navigator.permissions.query({
          name:
            "microphone" as PermissionName
        });

      setMicAllowed(
        mic.state === "granted"
      );

      /* NOTIFICATION */

      setNotificationAllowed(
        Notification.permission ===
          "granted"
      );

    } catch (error) {

      console.error(error);
    }
  }

  async function
  requestCameraPermission() {

    try {

      await navigator.mediaDevices.getUserMedia({
        video: true
      });

      setCameraAllowed(
        true
      );

    } catch (error) {

      console.error(error);
    }
  }

  async function
  requestMicPermission() {

    try {

      await navigator.mediaDevices.getUserMedia({
        audio: true
      });

      setMicAllowed(
        true
      );

    } catch (error) {

      console.error(error);
    }
  }

  async function
  requestNotificationPermission() {

    try {

      const permission =
        await Notification.requestPermission();

      setNotificationAllowed(
        permission === "granted"
      );

    } catch (error) {

      console.error(error);
    }
  }

  async function
  handleContinue() {

    setLoading(true);

    setTimeout(() => {

      window.location.href =
        "/mlm/watch-earn";

    }, 1200);
  }

  const allGranted =
    cameraAllowed &&
    micAllowed &&
    notificationAllowed;

  return (

    <main
      className="
        flex
        min-h-screen
        flex-col
        bg-black
        px-5
        py-8
        text-[var(--button-text-color)]
      "
    >

      {/* HEADER */}

      <div
        className="
          mb-10
          mt-8
        "
      >

        <div
          className="
            mb-5
            flex
            h-20
            w-20
            items-center
            justify-center
            rounded-full
            bg-violet-600/20
          "
        >

          <ShieldCheck
            size={40}
            className="
              text-violet-400
            "
          />

        </div>

        <h1
          className="
            text-4xl
            font-black
          "
        >

          Permissions Required

        </h1>

        <p
          className="
            mt-4
            text-sm
            leading-7
            text-gray-400
          "
        >

          JembeeKart needs some permissions
          for smooth video playback,
          uploads, notifications and
          rewards experience.
        </p>

      </div>

      {/* PERMISSIONS */}

      <div
        className="
          space-y-5
        "
      >

        {/* CAMERA */}

        <div
          className="
            rounded-3xl
            border
            border-white/10
            bg-[var(--card-color)]/5
            p-5
          "
        >

          <div
            className="
              flex
              items-center
              justify-between
            "
          >

            <div
              className="
                flex
                items-center
                gap-4
              "
            >

              <div
                className="
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-full
                  bg-[var(--secondary-color)]/20
                "
              >

                <Camera
                  size={24}
                  className="
                    text-violet-400
                  "
                />

              </div>

              <div>

                <h2
                  className="
                    text-lg
                    font-black
                  "
                >

                  Camera Access

                </h2>

                <p
                  className="
                    mt-1
                    text-xs
                    text-gray-400
                  "
                >

                  Upload videos & reels

                </p>

              </div>

            </div>

            <button
              onClick={
                requestCameraPermission
              }
              className={`
                rounded-full
                px-5
                py-2
                text-sm
                font-black

                ${
                  cameraAllowed
                    ? "bg-[var(--success-color)] text-[var(--button-text-color)]"
                    : "bg-violet-600 text-[var(--button-text-color)]"
                }
              `}
            >

              {cameraAllowed
                ? "Allowed"
                : "Allow"}

            </button>

          </div>

        </div>

        {/* MIC */}

        <div
          className="
            rounded-3xl
            border
            border-white/10
            bg-[var(--card-color)]/5
            p-5
          "
        >

          <div
            className="
              flex
              items-center
              justify-between
            "
          >

            <div
              className="
                flex
                items-center
                gap-4
              "
            >

              <div
                className="
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-full
                  bg-pink-500/20
                "
              >

                <Mic
                  size={24}
                  className="
                    text-pink-400
                  "
                />

              </div>

              <div>

                <h2
                  className="
                    text-lg
                    font-black
                  "
                >

                  Microphone

                </h2>

                <p
                  className="
                    mt-1
                    text-xs
                    text-gray-400
                  "
                >

                  Audio recording support

                </p>

              </div>

            </div>

            <button
              onClick={
                requestMicPermission
              }
              className={`
                rounded-full
                px-5
                py-2
                text-sm
                font-black

                ${
                  micAllowed
                    ? "bg-[var(--success-color)] text-[var(--button-text-color)]"
                    : "bg-pink-500 text-[var(--button-text-color)]"
                }
              `}
            >

              {micAllowed
                ? "Allowed"
                : "Allow"}

            </button>

          </div>

        </div>

        {/* NOTIFICATION */}

        <div
          className="
            rounded-3xl
            border
            border-white/10
            bg-[var(--card-color)]/5
            p-5
          "
        >

          <div
            className="
              flex
              items-center
              justify-between
            "
          >

            <div
              className="
                flex
                items-center
                gap-4
              "
            >

              <div
                className="
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-full
                  bg-[var(--warning-color)]/20
                "
              >

                <Bell
                  size={24}
                  className="
                    text-yellow-300
                  "
                />

              </div>

              <div>

                <h2
                  className="
                    text-lg
                    font-black
                  "
                >

                  Notifications

                </h2>

                <p
                  className="
                    mt-1
                    text-xs
                    text-gray-400
                  "
                >

                  Rewards & updates

                </p>

              </div>

            </div>

            <button
              onClick={
                requestNotificationPermission
              }
              className={`
                rounded-full
                px-5
                py-2
                text-sm
                font-black

                ${
                  notificationAllowed
                    ? "bg-[var(--success-color)] text-[var(--button-text-color)]"
                    : "bg-[var(--warning-color)] text-[var(--text-color)]"
                }
              `}
            >

              {notificationAllowed
                ? "Allowed"
                : "Allow"}

            </button>

          </div>

        </div>

      </div>

      {/* CONTINUE */}

      <div
        className="
          mt-auto
          pt-10
        "
      >

        <button
          onClick={
            handleContinue
          }

          disabled={
            !allGranted || loading
          }

          className={`
            flex
            w-full
            items-center
            justify-center
            gap-3
            rounded-3xl
            px-5
            py-5
            text-lg
            font-black
            transition-all

            ${
              allGranted
                ? "bg-gradient-to-r from-violet-600 to-fuchsia-500 text-[var(--button-text-color)]"
                : "bg-[var(--card-color)]/10 text-[var(--muted-text-color)]"
            }
          `}
        >

          <Play size={22} />

          {loading
            ? "Opening..."
            : "Continue"}

        </button>

      </div>

    </main>
  );
}

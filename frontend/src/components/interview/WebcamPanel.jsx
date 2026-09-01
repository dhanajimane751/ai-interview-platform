import useFaceDetection from "../../hooks/useFaceDetection";
import {
  useRef,
  useState,
  useCallback,
  useEffect,
} from "react";
import Webcam from "react-webcam";
import { motion } from "framer-motion";

const videoConstraints = {
  width: 640,
  height: 480,
  facingMode: "user",
};

function WebcamPanel({
  onStreamReady,
  onProctorWarning,
}) {
  const webcamRef = useRef(null);
  const streamRef = useRef(null);
  const audioContextRef =
    useRef(null);

  const [cameraError, setCameraError] =
    useState("");

  const [micActive, setMicActive] =
    useState(false);

  const [audioLevel, setAudioLevel] =
    useState(0);

  const handleProctorWarning =
    useCallback(
      (event) => {
        onProctorWarning?.(event);
      },
      [onProctorWarning]
    );

  const {
    modelsLoaded,
    faceCount,
  } = useFaceDetection(
    webcamRef,
    handleProctorWarning
  );

  const setupMicMeter =
    useCallback((stream) => {
      try {
        const AudioContext =
          window.AudioContext ||
          window.webkitAudioContext;

        if (!AudioContext) {
          return;
        }

        const audioContext =
          new AudioContext();

        audioContextRef.current =
          audioContext;

        const source =
          audioContext.createMediaStreamSource(
            stream
          );

        const analyser =
          audioContext.createAnalyser();

        analyser.fftSize = 256;

        source.connect(analyser);

        const dataArray =
          new Uint8Array(
            analyser.frequencyBinCount
          );

        setMicActive(true);

        let rafId;

        const updateLevel = () => {
          if (
            !audioContextRef.current
          ) {
            return;
          }

          analyser.getByteFrequencyData(
            dataArray
          );

          const average =
            dataArray.reduce(
              (sum, value) =>
                sum + value,
              0
            ) / dataArray.length;

          setAudioLevel(average);

          rafId =
            requestAnimationFrame(
              updateLevel
            );
        };

        updateLevel();

        audioContextRef.current._rafId =
          rafId;
      } catch (error) {
        console.error(
          "Microphone meter error:",
          error
        );

        onProctorWarning?.({
          type: "microphone_error",
          message:
            "Microphone monitoring could not be started.",
        });
      }
    }, [onProctorWarning]);

  const handleUserMedia =
    useCallback(
      (stream) => {
        setCameraError("");

        streamRef.current =
          stream;

        setupMicMeter(stream);

        onStreamReady?.(stream);
      },
      [
        onStreamReady,
        setupMicMeter,
      ]
    );

  const handleUserMediaError =
    useCallback(
      (error) => {
        console.error(
          "Webcam error:",
          error
        );

        setCameraError(
          "Camera/Microphone access denied or unavailable."
        );

        onProctorWarning?.({
          type: "camera_error",
          message:
            "Camera or microphone access was denied or unavailable.",
        });
      },
      [onProctorWarning]
    );

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track) =>
            track.stop()
          );

        streamRef.current = null;
      }

      if (
        audioContextRef.current
      ) {
        if (
          audioContextRef.current
            ._rafId
        ) {
          cancelAnimationFrame(
            audioContextRef.current
              ._rafId
          );
        }

        audioContextRef.current
          .close()
          .catch(() => {});

        audioContextRef.current =
          null;
      }
    };
  }, []);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl bg-black">
      {cameraError ? (
        <div className="flex h-full items-center justify-center px-4 text-center text-sm text-red-400">
          {cameraError}
        </div>
      ) : (
        <Webcam
          ref={webcamRef}
          audio
          muted
          videoConstraints={
            videoConstraints
          }
          onUserMedia={
            handleUserMedia
          }
          onUserMediaError={
            handleUserMediaError
          }
          className="h-full w-full object-cover"
        />
      )}

      {modelsLoaded && (
        <div className="absolute bottom-2 right-2 rounded-lg bg-black/60 px-2 py-1">
          <span
            className={`text-xs ${
              faceCount === 1
                ? "text-green-400"
                : "text-red-400"
            }`}
          >
            {faceCount === 0
              ? "No face"
              : faceCount === 1
              ? "Face OK"
              : `${faceCount} faces`}
          </span>
        </div>
      )}

      {micActive && (
        <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-lg bg-black/60 px-2 py-1">
          <motion.div
            animate={{
              scale:
                1 +
                audioLevel / 150,
            }}
            transition={{
              duration: 0.1,
            }}
            className="h-2 w-2 rounded-full bg-green-400"
          />

          <span className="text-xs text-slate-300">
            Mic
          </span>
        </div>
      )}

      <div className="absolute right-2 top-2 flex items-center gap-1 rounded-lg bg-black/60 px-2 py-1">
        <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />

        <span className="text-xs text-slate-300">
          Live
        </span>
      </div>
    </div>
  );
}

export default WebcamPanel;
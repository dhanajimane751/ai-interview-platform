import {
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import * as faceapi from "face-api.js";

function useFaceDetection(
  webcamRef,
  onWarning
) {
  const [modelsLoaded, setModelsLoaded] =
    useState(false);

  const [faceCount, setFaceCount] =
    useState(0);

  const intervalRef = useRef(null);
  const noFaceStreak =
    useRef(0);
  const multiFaceStreak =
    useRef(0);

  useEffect(() => {
    const loadModels = async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri(
          "/models"
        );

        setModelsLoaded(true);
      } catch (error) {
        console.error(
          "Face model loading failed:",
          error
        );

        setModelsLoaded(false);
      }
    };

    loadModels();
  }, []);

  const detectLoop = useCallback(
    async () => {
      const video =
        webcamRef.current?.video;

      if (
        !video ||
        video.readyState !== 4
      ) {
        return;
      }

      try {
        const detections =
          await faceapi.detectAllFaces(
            video,
            new faceapi.TinyFaceDetectorOptions(
              {
                inputSize: 224,
                scoreThreshold: 0.5,
              }
            )
          );

        const count =
          detections.length;

        setFaceCount(count);

        if (count === 0) {
          noFaceStreak.current += 1;
          multiFaceStreak.current = 0;

          if (
            noFaceStreak.current === 3
          ) {
            onWarning?.(
              {
                type: "no_face",
                message:
                  "No face detected. Please stay visible in the camera.",
              }
            );
          }
        } else if (count > 1) {
          multiFaceStreak.current += 1;
          noFaceStreak.current = 0;

          if (
            multiFaceStreak.current === 3
          ) {
            onWarning?.(
              {
                type: "multiple_faces",
                message:
                  "Multiple faces detected. Only the candidate should be visible.",
              }
            );
          }
        } else {
          noFaceStreak.current = 0;
          multiFaceStreak.current = 0;
        }
      } catch (error) {
        console.error(
          "Face detection error:",
          error
        );
      }
    },
    [webcamRef, onWarning]
  );

  useEffect(() => {
    if (!modelsLoaded) {
      return;
    }

    intervalRef.current =
      setInterval(
        detectLoop,
        2500
      );

    return () => {
      if (intervalRef.current) {
        clearInterval(
          intervalRef.current
        );
      }
    };
  }, [
    modelsLoaded,
    detectLoop,
  ]);

  return {
    modelsLoaded,
    faceCount,
  };
}

export default useFaceDetection;
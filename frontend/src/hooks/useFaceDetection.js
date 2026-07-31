import { useEffect, useRef, useState, useCallback } from "react";
import * as faceapi from "face-api.js";

function useFaceDetection(webcamRef, onWarning) {
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [faceCount, setFaceCount] = useState(0);
  const intervalRef = useRef(null);
  const noFaceStreak = useRef(0);
  const multiFaceStreak = useRef(0);

  useEffect(() => {
    const loadModels = async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
        setModelsLoaded(true);
        console.log("✅ Face detection models loaded successfully");
      } catch (err) {
        console.error("❌ Failed to load face detection models:", err);
        setModelsLoaded(false);
      }
    };
    loadModels();
  }, []);

  const detectLoop = useCallback(async () => {
    const video = webcamRef.current?.video;
    console.log("Video exists:", !!video, "readyState:", video?.readyState);
    if (!video || video.readyState !== 4) return;

    const detections = await faceapi.detectAllFaces(
      video,
      new faceapi.TinyFaceDetectorOptions()
    );
    console.log("Faces detected:", detections.length);
    setFaceCount(detections.length);

    if (detections.length === 0) {
      noFaceStreak.current += 1;
      multiFaceStreak.current = 0;
      if (noFaceStreak.current === 3) {
        onWarning("No face detected. Please stay visible in the camera.");
      }
    } else if (detections.length > 1) {
      multiFaceStreak.current += 1;
      noFaceStreak.current = 0;
      if (multiFaceStreak.current === 3) {
        onWarning("Multiple faces detected. Only the candidate should be visible.");
      }
    } else {
      noFaceStreak.current = 0;
      multiFaceStreak.current = 0;
    }
  }, [webcamRef, onWarning]);

  useEffect(() => {
    if (!modelsLoaded) return;

    intervalRef.current = setInterval(() => {
      detectLoop();
    }, 2000);

    return () => clearInterval(intervalRef.current);
  }, [modelsLoaded]);

  return { modelsLoaded, faceCount };
}

export default useFaceDetection;
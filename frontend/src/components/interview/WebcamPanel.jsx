import useFaceDetection from "../../hooks/useFaceDetection";
import { useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";
import { motion } from "framer-motion";

const videoConstraints = {
  width: 640,
  height: 480,
  facingMode: "user",
};

function WebcamPanel({ onStreamReady, onProctorWarning }) {
  const webcamRef = useRef(null);
  const [cameraError, setCameraError] = useState("");
  const [micActive, setMicActive] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);

  const handleProctorWarning = useCallback(
    (message) => {
      if (onProctorWarning) onProctorWarning(message);
    },
    [onProctorWarning]
  );

  const { modelsLoaded, faceCount } = useFaceDetection(webcamRef, handleProctorWarning);

  const handleUserMedia = useCallback(
    (stream) => {
      setCameraError("");
      setupMicMeter(stream);
      if (onStreamReady) onStreamReady(stream);
    },
    [onStreamReady]
  );

  const handleUserMediaError = useCallback((err) => {
    console.error("Webcam error:", err);
    setCameraError("Camera/Microphone access denied or unavailable.");
  }, []);

  const setupMicMeter = (stream) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    setMicActive(true);

    const updateLevel = () => {
      analyser.getByteFrequencyData(dataArray);
      const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
      setAudioLevel(avg);
      requestAnimationFrame(updateLevel);
    };
    updateLevel();
  };

  return (
    <div className="relative rounded-xl overflow-hidden bg-black w-full h-full">
      {cameraError ? (
        <div className="flex items-center justify-center h-full text-red-400 text-sm text-center px-4">
          {cameraError}
        </div>
      ) : (
        <Webcam
          ref={webcamRef}
          audio={true}
          muted={true}
          videoConstraints={videoConstraints}
          onUserMedia={handleUserMedia}
          onUserMediaError={handleUserMediaError}
          className="w-full h-full object-cover"
        />
      )}

      {modelsLoaded && (
        <div className="absolute bottom-2 right-2 bg-black/50 px-2 py-1 rounded-lg">
          <span className={`text-xs ${faceCount === 1 ? "text-green-400" : "text-red-400"}`}>
            {faceCount === 0 ? "No face" : faceCount === 1 ? "Face OK" : `${faceCount} faces`}
          </span>
        </div>
      )}

      {micActive && (
        <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/50 px-2 py-1 rounded-lg">
          <motion.div
            animate={{ scale: 1 + audioLevel / 150 }}
            transition={{ duration: 0.1 }}
            className="w-2 h-2 rounded-full bg-green-400"
          />
          <span className="text-xs text-slate-300">Mic</span>
        </div>
      )}

      <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/50 px-2 py-1 rounded-lg">
        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse-slow" />
        <span className="text-xs text-slate-300">Live</span>
      </div>
    </div>
  );
}

export default WebcamPanel;
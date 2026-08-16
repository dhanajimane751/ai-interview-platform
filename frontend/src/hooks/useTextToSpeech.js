import { useCallback, useState, useEffect, useRef } from "react";

function useTextToSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState([]);
  const utteranceRef = useRef(null);

  useEffect(() => {
    const loadVoices = () => {
      const available = window.speechSynthesis.getVoices();
      setVoices(available);
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => window.speechSynthesis.cancel();
  }, []);

const getBestVoice = useCallback(() => {
  const preferenceOrder = [
    "Google UK English Male",
    "Google UK English Female",
    "Google US English",
    "Microsoft Aria Online (Natural) - English (United States)",
    "Microsoft Jenny Online (Natural) - English (United States)",
    "Samantha",
    "en-GB",
    "en-US",
  ];

  for (const pref of preferenceOrder) {
    const match = voices.find((v) => v.name.includes(pref) || v.lang === pref);
    if (match) return match;
  }
  return voices[0];
}, [voices]);

  const speak = useCallback(
    (text) => {
      return new Promise((resolve) => {
        if (!text || !window.speechSynthesis) {
          resolve();
          return;
        }
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.98;
        utterance.pitch = 1.05;
        utterance.volume = 1;

        const bestVoice = getBestVoice();
        if (bestVoice) utterance.voice = bestVoice;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => {
          setIsSpeaking(false);
          resolve();
        };
        utterance.onerror = () => {
          setIsSpeaking(false);
          resolve();
        };

        utteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
      });
    },
    [getBestVoice]
  );

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  return { speak, stopSpeaking, isSpeaking, voices };
}

export default useTextToSpeech;
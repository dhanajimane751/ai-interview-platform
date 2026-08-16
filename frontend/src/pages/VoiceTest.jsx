import { useState } from "react";
import useTextToSpeech from "../hooks/useTextToSpeech";

function VoiceTest() {
  const { voices } = useTextToSpeech();
  const [selectedVoice, setSelectedVoice] = useState(null);

  const testVoice = (voice) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(
      "Hello, I'll be your interviewer today. Let's get started."
    );
    utterance.voice = voice;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="min-h-screen px-6 py-10 max-w-2xl mx-auto">
      <h1 className="font-display text-2xl font-bold mb-6">Available Voices on This Device</h1>
      <div className="space-y-2">
        {voices.map((voice, i) => (
          <div
            key={i}
            className="glass-card rounded-lg p-3 flex justify-between items-center"
          >
            <div>
              <p className="text-sm font-medium">{voice.name}</p>
              <p className="text-xs text-slate-500">{voice.lang}</p>
            </div>
            <button
              onClick={() => testVoice(voice)}
              className="btn-gradient text-white text-xs px-3 py-1.5 rounded-lg"
            >
              ▶ Test
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default VoiceTest;
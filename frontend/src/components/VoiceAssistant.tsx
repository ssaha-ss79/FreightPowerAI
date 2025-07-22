import React, { useEffect, useRef, useState } from 'react';

const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
const synth = window.speechSynthesis;

interface VoiceAssistantProps {
  onCommand?: (command: string) => void;
  onToggle?: (active: boolean) => void;
}

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ onCommand, onToggle }) => {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      if (onCommand) onCommand(text);
      speak(`You said: ${text}`);
    };
    recognition.onend = () => {
      setListening(false);
      if (onToggle) onToggle(false);
    };
    recognitionRef.current = recognition;
  }, [onCommand, onToggle]);

  const startListening = () => {
    if (recognitionRef.current && !listening) {
      setTranscript('');
      setListening(true);
      if (onToggle) onToggle(true);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && listening) {
      recognitionRef.current.stop();
      setListening(false);
      if (onToggle) onToggle(false);
    }
  };

  const speak = (text: string) => {
    if (synth) {
      const utter = new SpeechSynthesisUtterance(text);
      synth.speak(utter);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 bg-slate-800/90 backdrop-blur-sm shadow-lg rounded-xl p-4 flex flex-col items-center z-50 border border-blue-500/20">
      <button
        className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${listening ? 'bg-red-500 animate-pulse' : 'bg-blue-600'} text-white text-2xl focus:outline-none transition-all duration-300`}
        onClick={listening ? stopListening : startListening}
        aria-label={listening ? 'Stop listening' : 'Start listening'}
      >
        <span role="img" aria-label="mic">🎤</span>
      </button>
      <div className="text-xs text-white min-h-[1.5em] text-center">
        {listening ? 'Axel is listening...' : transcript || 'Click to talk to Axel'}
      </div>
    </div>
  );
};

export default VoiceAssistant;

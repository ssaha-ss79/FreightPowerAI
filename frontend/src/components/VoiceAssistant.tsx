import React, { useEffect, useRef, useState } from 'react';
import { apiRequest } from '../utils/api';

const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
const synth = window.speechSynthesis;

interface VoiceAssistantProps {
  onCommand?: (command: string) => void;
  onToggle?: (active: boolean) => void;
}

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ onCommand, onToggle }) => {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = async (event: any) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      if (onCommand) onCommand(text);
      // Parse and handle command
      await handleVoiceQuery(text);
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
      setResponse('');
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

  // Helper: Parse and handle voice queries
  const handleVoiceQuery = async (text: string) => {
    const lower = text.toLowerCase();
    // Loads count
    if (lower.includes('how many loads') || lower.includes('number of loads')) {
      try {
        const data = await apiRequest('/api/v1/assistant/summary');
        const count = data.loads_count ?? 0;
        const answer = `There are ${count} loads available.`;
        setResponse(answer);
        speak(answer);
      } catch {
        setResponse('Sorry, I could not fetch the loads count.');
        speak('Sorry, I could not fetch the loads count.');
      }
      return;
    }
    // Active trips
    if (lower.includes('how many trips') || lower.includes('active trips')) {
      try {
        const data = await apiRequest('/api/v1/assistant/summary');
        const count = data.trips_count ?? 0;
        const answer = `There are ${count} active trips.`;
        setResponse(answer);
        speak(answer);
      } catch {
        setResponse('Sorry, I could not fetch the trips count.');
        speak('Sorry, I could not fetch the trips count.');
      }
      return;
    }
    // Documents
    if (lower.includes('how many documents') || lower.includes('uploaded documents')) {
      try {
        const data = await apiRequest('/api/v1/assistant/summary');
        const count = data.documents_count ?? 0;
        const answer = `You have uploaded ${count} documents.`;
        setResponse(answer);
        speak(answer);
      } catch {
        setResponse('Sorry, I could not fetch the documents count.');
        speak('Sorry, I could not fetch the documents count.');
      }
      return;
    }
    // Notifications
    if (lower.includes('how many notifications') || lower.includes('unread notifications')) {
      try {
        const data = await apiRequest('/api/v1/assistant/summary');
        const count = data.notifications_count ?? 0;
        const answer = `You have ${count} notifications.`;
        setResponse(answer);
        speak(answer);
      } catch {
        setResponse('Sorry, I could not fetch the notifications count.');
        speak('Sorry, I could not fetch the notifications count.');
      }
      return;
    }
    // Emergency logs
    if (lower.includes('emergency') && lower.includes('triggered')) {
      try {
        const data = await apiRequest('/api/v1/assistant/summary');
        const count = data.emergency_count ?? 0;
        const answer = `There have been ${count} emergency events triggered.`;
        setResponse(answer);
        speak(answer);
      } catch {
        setResponse('Sorry, I could not fetch emergency logs.');
        speak('Sorry, I could not fetch emergency logs.');
      }
      return;
    }
    // Help
    if (lower.includes('help') || lower.includes('what can you do')) {
      const answer = 'You can ask me about loads, trips, documents, notifications, or emergencies. For example, say: How many loads are there?';
      setResponse(answer);
      speak(answer);
      return;
    }
    // Fallback
    setResponse('Sorry, I did not understand. Try asking about loads, trips, documents, notifications, or emergencies.');
    speak('Sorry, I did not understand. Try asking about loads, trips, documents, notifications, or emergencies.');
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
      {response && (
        <div className="text-xs text-blue-200 mt-2 text-center min-h-[1.5em]">{response}</div>
      )}
    </div>
  );
};

export default VoiceAssistant;

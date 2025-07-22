import React, { useState, useRef } from 'react';
import { apiRequest } from '../utils/api';

interface DispatchMessage {
  id: string;
  sender_id: string;
  sender_name: string;
  receiver_id: string;
  message_type: 'voice_note' | 'text';
  content_url?: string;
  text_content?: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
}

const DispatchCommunication: React.FC = () => {
  const [messages, setMessages] = useState<DispatchMessage[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [textMessage, setTextMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  React.useEffect(() => {
    loadMessages();
    // Simulate some existing messages
    setMessages([
      {
        id: '1',
        sender_id: 'dispatch_001',
        sender_name: 'Dispatch Center',
        receiver_id: 'current_driver',
        message_type: 'text',
        text_content: 'Your next load pickup is confirmed for 14:00 at Warehouse B. Please confirm receipt.',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        status: 'delivered'
      },
      {
        id: '2',
        sender_id: 'current_driver',
        sender_name: 'You',
        receiver_id: 'dispatch_001',
        message_type: 'voice_note',
        content_url: '#',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        status: 'read'
      },
      {
        id: '3',
        sender_id: 'dispatch_001',
        sender_name: 'Dispatch Center',
        receiver_id: 'current_driver',
        message_type: 'text',
        text_content: 'Weather alert: Heavy rain expected on I-75. Consider taking alternate route.',
        timestamp: new Date(Date.now() - 900000).toISOString(),
        status: 'read'
      }
    ]);
  }, []);

  const loadMessages = async () => {
    try {
      const data = await apiRequest('/api/v1/dispatch/messages/current_driver');
      setMessages(data);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const sendTextMessage = async () => {
    if (!textMessage.trim()) return;

    try {
      setLoading(true);
      const newMessage: DispatchMessage = {
        id: Date.now().toString(),
        sender_id: 'current_driver',
        sender_name: 'You',
        receiver_id: 'dispatch_001',
        message_type: 'text',
        text_content: textMessage,
        timestamp: new Date().toISOString(),
        status: 'sent'
      };

      // Add message locally first
      setMessages([...messages, newMessage]);
      setTextMessage('');

      // Send to server
      await apiRequest('/api/v1/dispatch/send-text-message', {
        method: 'POST',
        body: JSON.stringify({
          sender_id: 'current_driver',
          receiver_id: 'dispatch_001',
          text_content: textMessage
        })
      });

      // Voice confirmation
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance('Message sent to dispatch');
        speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await sendVoiceMessage(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Voice feedback
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance('Recording voice message for dispatch');
        speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.error('Failed to start recording:', error);
      alert('Unable to access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const sendVoiceMessage = async (audioBlob: Blob) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('audio', audioBlob, 'voice_message.wav');
      formData.append('sender_id', 'current_driver');
      formData.append('receiver_id', 'dispatch_001');

      const newMessage: DispatchMessage = {
        id: Date.now().toString(),
        sender_id: 'current_driver',
        sender_name: 'You',
        receiver_id: 'dispatch_001',
        message_type: 'voice_note',
        content_url: URL.createObjectURL(audioBlob),
        timestamp: new Date().toISOString(),
        status: 'sent'
      };

      setMessages([...messages, newMessage]);

      await apiRequest('/api/v1/dispatch/send-voice-message', {
        method: 'POST',
        body: formData,
        headers: {} // Let fetch set content-type for FormData
      });

      // Voice confirmation
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance('Voice message sent to dispatch');
        speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.error('Failed to send voice message:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickMessages = [
    'Load delivered successfully',
    'Arriving at pickup location',
    'Delayed due to traffic',
    'Need assistance',
    'Fuel break required'
  ];

  const sendQuickMessage = (message: string) => {
    setTextMessage(message);
    setTimeout(() => sendTextMessage(), 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Dispatch Communication</h2>
          <p className="text-blue-300">Stay connected with dispatch center</p>
        </div>
        <button
          onClick={loadMessages}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Quick Messages */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-blue-500/20">
        <h3 className="text-white font-bold mb-4">Quick Messages</h3>
        <div className="flex flex-wrap gap-2">
          {quickMessages.map((message, index) => (
            <button
              key={index}
              onClick={() => sendQuickMessage(message)}
              className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 px-3 py-2 rounded-lg text-sm transition-colors"
            >
              {message}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-blue-500/20 h-96 flex flex-col">
        <div className="p-4 border-b border-gray-600">
          <h3 className="text-white font-bold">Messages with Dispatch</h3>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-600">
          <div className="flex space-x-3">
            <input
              type="text"
              value={textMessage}
              onChange={(e) => setTextMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendTextMessage()}
              placeholder="Type your message to dispatch..."
              className="flex-1 bg-slate-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
              disabled={loading}
            />
            <button
              onClick={sendTextMessage}
              disabled={!textMessage.trim() || loading}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              📤
            </button>
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`px-4 py-2 rounded-lg transition-colors ${
                isRecording
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                  : 'bg-green-500 hover:bg-green-600'
              } text-white`}
            >
              {isRecording ? '⏹️' : '🎤'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Message Bubble Component
const MessageBubble: React.FC<{ message: DispatchMessage }> = ({ message }) => {
  const isFromMe = message.sender_id === 'current_driver';
  
  const playVoiceMessage = () => {
    if (message.content_url) {
      const audio = new Audio(message.content_url);
      audio.play().catch(console.error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return '📤';
      case 'delivered': return '✓';
      case 'read': return '✓✓';
      default: return '';
    }
  };

  return (
    <div className={`flex ${isFromMe ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs lg:max-w-md rounded-lg p-3 ${
        isFromMe 
          ? 'bg-blue-500 text-white' 
          : 'bg-slate-700 text-white'
      }`}>
        <div className="text-xs opacity-75 mb-1">{message.sender_name}</div>
        
        {message.message_type === 'text' ? (
          <div>{message.text_content}</div>
        ) : (
          <div className="flex items-center space-x-2">
            <button
              onClick={playVoiceMessage}
              className="bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
            >
              ▶️
            </button>
            <span className="text-sm">Voice Message</span>
          </div>
        )}
        
        <div className="flex items-center justify-between mt-2 text-xs opacity-75">
          <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
          {isFromMe && <span>{getStatusIcon(message.status)}</span>}
        </div>
      </div>
    </div>
  );
};

export default DispatchCommunication;

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, ArrowLeft, Loader2, Sparkles, Mic, Volume2, StopCircle, Square } from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function SahayakBot({ setActiveTab }) {
  const [messages, setMessages] = useState([
    { role: 'bot', text: "Namaste! I am Sahayak. Ask me anything about farming." }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  // --- VOICE STATE ---
  const [isRecording, setIsRecording] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const messagesEndRef = useRef(null);
  
  // --- 1. TOGGLE RECORDING (Click to Start/Stop) ---
  const toggleRecording = async () => {
    if (isRecording) {
      // STOP
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
      }
    } else {
      // START
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        chunksRef.current = [];

        mediaRecorderRef.current.ondataavailable = (e) => {
          if (e.data.size > 0) chunksRef.current.push(e.data);
        };

        mediaRecorderRef.current.onstop = async () => {
          const audioBlob = new Blob(chunksRef.current, { type: 'audio/mp3' });
          handleVoiceSend(audioBlob); // Send immediately when stopped
          
          // Stop all tracks to release mic
          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorderRef.current.start();
        setIsRecording(true);
      } catch (err) {
        alert("Microphone access denied. Please allow permission.");
      }
    }
  };

  // --- 2. SEND AUDIO TO BACKEND ---
  const handleVoiceSend = async (audioBlob) => {
    setLoading(true);
    
    // Add a temporary "Listening..." bubble
    const tempId = Date.now();
    setMessages(prev => [...prev, { role: 'user', text: "🎤 (Processing Audio...)", id: tempId }]);

    const formData = new FormData();
    formData.append("file", audioBlob, "voice.mp3");

    try {
      const res = await fetch(`${API_BASE_URL}/api/chat-voice`, {
        method: "POST",
        body: formData
      });
      const data = await res.json();

      // Replace temp message with actual response
      setMessages(prev => [
        ...prev.filter(m => m.id !== tempId),
        { role: 'user', text: "🎤 Voice Query Sent" },
        { role: 'bot', text: data.reply }
      ]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'bot', text: "Error analyzing voice. Try again." }]);
    } finally {
      setLoading(false);
    }
  };

  // --- 3. TEXT TO SPEECH ---
  const speakMessage = (text, index) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      if (speakingMsgId === index) {
        setSpeakingMsgId(null);
        return;
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = /[\u0900-\u097F]/.test(text) ? 'hi-IN' : 'en-IN'; 
      utterance.onstart = () => setSpeakingMsgId(index);
      utterance.onend = () => setSpeakingMsgId(null);
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Text-to-speech not supported.");
    }
  };

  // --- 4. TEXT SEND ---
  const handleTextSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg.text })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'bot', text: data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'bot', text: "Network error." }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), [messages]);

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] md:h-[calc(100vh-140px)] animate-in fade-in zoom-in duration-500">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-4 shrink-0">
        <button onClick={() => setActiveTab('dashboard')} className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition backdrop-blur-md">
            <ArrowLeft className="text-white" />
        </button>
        <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                Sahayak AI <Sparkles size={18} className="text-yellow-400" />
            </h2>
            <p className="text-green-200/60 text-sm">Universal Voice Chat</p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 glass-panel rounded-3xl p-4 overflow-hidden flex flex-col relative border border-white/10">
        <div className="flex-1 overflow-y-auto space-y-4 p-2 scrollbar-hide">
            {messages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-white/10' : 'bg-green-500'}`}>
                        {msg.role === 'user' ? <User size={20} /> : <Bot size={24} className="text-white" />}
                    </div>
                    <div className={`p-4 rounded-2xl max-w-[80%] text-sm md:text-base leading-relaxed group relative ${msg.role === 'user' ? 'bg-white/10 text-white rounded-tr-none' : 'bg-green-500/10 border border-green-500/20 text-green-100 rounded-tl-none'}`}>
                        <p className="whitespace-pre-line">{msg.text}</p>
                        {msg.role === 'bot' && (
                          <button onClick={() => speakMessage(msg.text, i)} className={`absolute -right-10 top-2 p-2 rounded-full transition opacity-0 group-hover:opacity-100 ${speakingMsgId === i ? 'opacity-100 bg-green-500 text-white animate-pulse' : 'bg-white/5 text-white/50 hover:bg-white/20'}`}>
                            {speakingMsgId === i ? <StopCircle size={16} /> : <Volume2 size={16} />}
                          </button>
                        )}
                    </div>
                </div>
            ))}
            {loading && <div className="flex gap-2 items-center text-green-400 text-sm ml-12"><Loader2 size={16} className="animate-spin" /> Sahayak is thinking...</div>}
            <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleTextSend} className="mt-4 flex gap-2 pt-4 border-t border-white/10">
            {/* TOGGLE BUTTON */}
            <button
                type="button"
                onClick={toggleRecording}
                className={`p-3 rounded-xl transition flex items-center justify-center ${
                    isRecording ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/40' : 'bg-white/5 text-white/50 hover:bg-white/20'
                }`}
                title={isRecording ? "Stop Recording" : "Start Voice Chat"}
            >
                {isRecording ? <Square size={20} /> : <Mic size={20} />}
            </button>

            <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isRecording ? "Listening..." : "Type or Click Mic..."}
                disabled={isRecording}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-400 transition"
            />
            <button type="submit" disabled={loading || !input.trim()} className="bg-green-500 text-white p-3 rounded-xl hover:bg-green-400 transition disabled:opacity-50">
                <Send size={20} />
            </button>
        </form>
      </div>
    </div>
  );
}
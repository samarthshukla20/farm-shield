import { useState, useRef, useEffect } from 'react';
import { Camera, Upload, X, ScanLine, Sprout, AlertTriangle, ArrowLeft, Loader2, CheckCircle, Mic, Volume2, StopCircle, Square } from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function PestScanner({ setActiveTab }) {
  const [mode, setMode] = useState('scan'); 
  
  // Image State
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);

  // Voice State
  const [isRecording, setIsRecording] = useState(false);
  const [voiceSolution, setVoiceSolution] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  // --- 1. IMAGE LOGIC ---
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
    }
  };

  const handleScan = async () => {
    if (!image) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("file", image);

    try {
      const res = await fetch(`${API_BASE_URL}/api/pest-scan`, { method: "POST", body: formData });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (err) {
      alert("Scan failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // --- 2. UNIVERSAL VOICE LOGIC (Brave Compatible) ---
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
          handleVoiceSend(audioBlob); 
          stream.getTracks().forEach(track => track.stop()); // Release mic
        };

        mediaRecorderRef.current.start();
        setIsRecording(true);
        setVoiceSolution(''); // Clear previous answer
      } catch (err) {
        alert("Microphone access denied. Please check browser settings.");
      }
    }
  };

  const handleVoiceSend = async (audioBlob) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("file", audioBlob, "query.mp3");

    try {
      const res = await fetch(`${API_BASE_URL}/api/pest-query-voice`, {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      setVoiceSolution(data.solution || data.error);
    } catch (err) {
      setVoiceSolution("Sorry, I couldn't connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  // --- 3. TEXT TO SPEECH ---
  const toggleSpeech = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(voiceSolution);
      utterance.lang = /[\u0900-\u097F]/.test(voiceSolution) ? 'hi-IN' : 'en-IN';
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  return (
    <div className="animate-in fade-in zoom-in duration-500 pb-20">
      
      {/* Header & Toggle */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto">
            <button onClick={() => setActiveTab('dashboard')} className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition">
                <ArrowLeft className="text-white" />
            </button>
            <div>
                <h2 className="text-2xl font-bold text-white">Dr. Crop</h2>
                <p className="text-green-200/60 text-sm">AI Consultant</p>
            </div>
        </div>

        <div className="flex bg-white/10 p-1 rounded-xl w-full md:w-auto">
            <button onClick={() => setMode('scan')} className={`flex-1 md:flex-none px-6 py-2 rounded-lg font-bold transition flex items-center justify-center gap-2 ${mode === 'scan' ? 'bg-green-500 text-white' : 'text-white/50'}`}>
                <Camera size={18} /> Photo Scan
            </button>
            <button onClick={() => setMode('voice')} className={`flex-1 md:flex-none px-6 py-2 rounded-lg font-bold transition flex items-center justify-center gap-2 ${mode === 'voice' ? 'bg-green-500 text-white' : 'text-white/50'}`}>
                <Mic size={18} /> Voice Help
            </button>
        </div>
      </div>

      {mode === 'scan' ? (
          // --- PHOTO SCAN UI ---
          <div className="grid md:grid-cols-2 gap-8">
            <div className="glass-panel p-6 rounded-3xl border border-white/10 flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden">
                {preview ? (
                    <div className="relative w-full h-full flex flex-col items-center">
                        <img src={preview} alt="Scan" className="rounded-2xl max-h-[300px] object-cover border-2 border-white/20 shadow-2xl" />
                        {!loading && !result && (
                            <div className="flex gap-4 mt-6">
                                <button onClick={() => { setPreview(null); setImage(null); }} className="px-6 py-3 bg-red-500/20 text-red-200 rounded-xl hover:bg-red-500/30 transition flex items-center gap-2 font-bold">
                                    <X size={20} /> Retake
                                </button>
                                <button onClick={handleScan} className="px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-400 transition flex items-center gap-2 font-bold shadow-lg shadow-green-500/20">
                                    <ScanLine size={20} /> Diagnose
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center">
                        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ScanLine size={40} className="text-green-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Upload a Photo</h3>
                        <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileSelect} />
                        <div className="flex flex-col gap-3">
                            <button onClick={() => fileInputRef.current.click()} className="px-8 py-4 bg-white text-black rounded-xl font-bold hover:scale-105 transition flex items-center justify-center gap-2"><Upload size={20} /> Gallery</button>
                            <button onClick={() => fileInputRef.current.click()} className="px-8 py-4 bg-white/10 text-white rounded-xl font-bold hover:bg-white/20 transition flex items-center justify-center gap-2"><Camera size={20} /> Camera</button>
                        </div>
                    </div>
                )}
                {loading && <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-20"><Loader2 size={60} className="text-green-500 animate-spin" /></div>}
            </div>
            
            <div className="space-y-6">
                {result && (
                    <div className="animate-in slide-in-from-right duration-500">
                        <div className={`p-6 rounded-3xl mb-6 border relative overflow-hidden ${result.diagnosis.toLowerCase().includes('healthy') ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                            <div className="flex items-start justify-between mb-4 relative z-10">
                                <div><h2 className="text-3xl font-bold text-white mt-1">{result.diagnosis}</h2></div>
                                {result.diagnosis.toLowerCase().includes('healthy') ? <CheckCircle size={40} className="text-green-500" /> : <AlertTriangle size={40} className="text-red-500" />}
                            </div>
                            <p className="text-white/80 leading-relaxed text-sm relative z-10">{result.symptoms}</p>
                        </div>
                        {result.remedy && (
                            <div className="glass-panel p-6 rounded-3xl border border-white/10">
                                <h3 className="text-xl font-bold text-white mb-4"><span className="text-green-400">💊</span> Cure</h3>
                                <ul className="space-y-3">{result.remedy.map((step, i) => (<li key={i} className="flex gap-4 p-3 bg-white/5 rounded-xl border border-white/5"><span className="flex-shrink-0 w-8 h-8 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center font-bold text-sm">{i + 1}</span><p className="text-green-100/80 text-sm">{step}</p></li>))}</ul>
                            </div>
                        )}
                    </div>
                )}
            </div>
          </div>
      ) : (
          // --- VOICE UI (Updated for Brave) ---
          <div className="glass-panel p-8 md:p-12 rounded-3xl min-h-[500px] flex flex-col items-center justify-center text-center relative overflow-hidden">
             
             {/* Mic Button */}
             <div className="mb-8">
                 <button 
                    onClick={toggleRecording}
                    className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isRecording 
                        ? 'bg-red-500 animate-pulse shadow-[0_0_50px_rgba(239,68,68,0.5)]' 
                        : 'bg-green-500/10 hover:bg-green-500/20'
                    }`}
                 >
                    {isRecording ? <Square size={40} className="text-white" /> : <Mic size={50} className="text-green-400" />}
                 </button>
             </div>

             <h3 className="text-3xl font-bold text-white mb-2">
                {isRecording ? "Listening..." : "Tap to Speak"}
             </h3>
             <p className="text-white/50 mb-8 max-w-md">
                Describe your crop problem in Hindi or English.
             </p>

             {loading && <div className="mt-4 flex items-center gap-2 text-green-400"><Loader2 className="animate-spin" /> Analyzing Audio...</div>}

             {voiceSolution && !loading && (
                <div className="mt-6 p-6 bg-green-500/10 border border-green-500/30 rounded-2xl max-w-2xl w-full animate-in slide-in-from-bottom duration-500 text-left">
                    <div className="flex justify-between items-start mb-4">
                        <h4 className="text-xl font-bold text-green-400">Gemini's Advice</h4>
                        <button 
                            onClick={toggleSpeech}
                            className={`p-3 rounded-full transition ${isSpeaking ? 'bg-red-500 text-white animate-pulse' : 'bg-white/10 text-white hover:bg-white/20'}`}
                        >
                            {isSpeaking ? <StopCircle size={24} /> : <Volume2 size={24} />}
                        </button>
                    </div>
                    <p className="text-white/90 text-lg leading-relaxed whitespace-pre-line">{voiceSolution}</p>
                </div>
             )}
          </div>
      )}
    </div>
  );
}
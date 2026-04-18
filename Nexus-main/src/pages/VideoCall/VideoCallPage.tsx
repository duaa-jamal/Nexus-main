import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Video, VideoOff, Mic, MicOff, PhoneOff,
  Monitor, MonitorOff, MessageCircle, Users,
  Maximize2, MoreVertical
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';

type CallStatus = 'connecting' | 'connected' | 'ended';

export const VideoCallPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [callStatus, setCallStatus]       = useState<CallStatus>('connecting');
  const [isVideoOn, setIsVideoOn]         = useState(true);
  const [isAudioOn, setIsAudioOn]         = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isChatOpen, setIsChatOpen]       = useState(false);
  const [isParticipants, setIsParticipants] = useState(false);
  const [callDuration, setCallDuration]   = useState(0);
  const [chatMessages, setChatMessages]   = useState([
    { id: 1, sender: 'Sarah (Investor)', text: 'Hello! Can you hear me?', time: '10:00 AM' },
    { id: 2, sender: 'You', text: 'Yes! Great connection today.', time: '10:01 AM' },
  ]);
  const [newMessage, setNewMessage]       = useState('');
  const localVideoRef  = useRef<HTMLVideoElement>(null);
  const timerRef       = useRef<ReturnType<typeof setInterval> | null>(null);

  // Simulate connection after 2 seconds
  useEffect(() => {
    const timeout = setTimeout(() => setCallStatus('connected'), 2000);
    return () => clearTimeout(timeout);
  }, []);

  // Start timer when connected
  useEffect(() => {
    if (callStatus === 'connected') {
      timerRef.current = setInterval(() => setCallDuration(d => d + 1), 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [callStatus]);

  // Access webcam
  useEffect(() => {
    if (isVideoOn && localVideoRef.current) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then(stream => {
          if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        })
        .catch(() => {});
    } else if (localVideoRef.current?.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(t => t.stop());
      localVideoRef.current.srcObject = null;
    }
  }, [isVideoOn]);

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleEndCall = () => {
    setCallStatus('ended');
    if (timerRef.current) clearInterval(timerRef.current);
    if (localVideoRef.current?.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(t => t.stop());
    }
    setTimeout(() => navigate(-1), 2000);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    setChatMessages(prev => [...prev, {
      id: Date.now(),
      sender: 'You',
      text: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }]);
    setNewMessage('');
  };

  // ── Ended screen ──
  if (callStatus === 'ended') {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4 animate-fade-in">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
          <PhoneOff size={36} className="text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Call Ended</h2>
        <p className="text-gray-500">Duration: {formatDuration(callDuration)}</p>
        <p className="text-sm text-gray-400">Redirecting you back...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Video Call</h1>
          <p className="text-gray-600">
            {callStatus === 'connecting' ? 'Connecting...' : `Connected · ${formatDuration(callDuration)}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setIsChatOpen(o => !o); setIsParticipants(false); }}
            className={`p-2 rounded-lg border transition-colors ${isChatOpen ? 'bg-primary-50 border-primary-200 text-primary-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            <MessageCircle size={18} />
          </button>
          <button
            onClick={() => { setIsParticipants(o => !o); setIsChatOpen(false); }}
            className={`p-2 rounded-lg border transition-colors ${isParticipants ? 'bg-primary-50 border-primary-200 text-primary-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            <Users size={18} />
          </button>
        </div>
      </div>

      <div className="flex gap-4">
        {/* ── Video Area ── */}
        <div className="flex-1 space-y-3">

          {/* Connecting overlay */}
          {callStatus === 'connecting' && (
            <div className="w-full h-96 bg-gray-900 rounded-2xl flex flex-col items-center justify-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-400"></div>
              <p className="text-white text-lg font-medium">Connecting to call...</p>
              <p className="text-gray-400 text-sm">Please wait while we set up your session</p>
            </div>
          )}

          {/* Main video — remote participant (mock) */}
          {callStatus === 'connected' && (
            <div className="relative w-full bg-gray-900 rounded-2xl overflow-hidden" style={{ height: '420px' }}>
              {/* Mock remote video — gradient avatar */}
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-400 to-primary-700 flex items-center justify-center mb-3 shadow-lg">
                  <span className="text-white text-3xl font-bold">S</span>
                </div>
                <p className="text-white text-lg font-semibold">Sarah (Investor)</p>
                <p className="text-gray-400 text-sm mt-1">
                  {isVideoOn ? 'Camera On' : 'Camera Off'}
                </p>
              </div>

              {/* Screen share badge */}
              {isScreenSharing && (
                <div className="absolute top-4 left-4 bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                  <Monitor size={12} /> Screen Sharing
                </div>
              )}

              {/* Duration badge */}
              <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white text-sm px-3 py-1 rounded-full">
                {formatDuration(callDuration)}
              </div>

              {/* Local video — picture-in-picture */}
              <div className="absolute bottom-4 right-4 w-36 h-28 bg-gray-700 rounded-xl overflow-hidden border-2 border-white shadow-lg">
                {isVideoOn ? (
                  <video
                    ref={localVideoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800">
                    <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center">
                      <span className="text-white text-sm font-bold">
                        {user?.name?.charAt(0) ?? 'U'}
                      </span>
                    </div>
                    <p className="text-gray-400 text-xs mt-1">Camera Off</p>
                  </div>
                )}
              </div>

              {/* Audio muted indicator */}
              {!isAudioOn && (
                <div className="absolute bottom-4 left-4 bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                  <MicOff size={12} /> Muted
                </div>
              )}
            </div>
          )}

          {/* ── Controls Bar ── */}
          {callStatus === 'connected' && (
            <div className="flex items-center justify-center gap-3 py-3 px-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
              {/* Mic */}
              <button
                onClick={() => setIsAudioOn(o => !o)}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
                  isAudioOn
                    ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    : 'bg-red-100 hover:bg-red-200 text-red-600'
                }`}
                title={isAudioOn ? 'Mute' : 'Unmute'}
              >
                {isAudioOn ? <Mic size={22} /> : <MicOff size={22} />}
                <span className="text-xs font-medium">{isAudioOn ? 'Mute' : 'Unmute'}</span>
              </button>

              {/* Video */}
              <button
                onClick={() => setIsVideoOn(o => !o)}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
                  isVideoOn
                    ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    : 'bg-red-100 hover:bg-red-200 text-red-600'
                }`}
                title={isVideoOn ? 'Turn off camera' : 'Turn on camera'}
              >
                {isVideoOn ? <Video size={22} /> : <VideoOff size={22} />}
                <span className="text-xs font-medium">{isVideoOn ? 'Stop Video' : 'Start Video'}</span>
              </button>

              {/* Screen share */}
              <button
                onClick={() => setIsScreenSharing(o => !o)}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
                  isScreenSharing
                    ? 'bg-green-100 hover:bg-green-200 text-green-600'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
                title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
              >
                {isScreenSharing ? <MonitorOff size={22} /> : <Monitor size={22} />}
                <span className="text-xs font-medium">{isScreenSharing ? 'Stop Share' : 'Share Screen'}</span>
              </button>

              {/* Fullscreen */}
              <button
                className="flex flex-col items-center gap-1 p-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all"
                title="Fullscreen"
              >
                <Maximize2 size={22} />
                <span className="text-xs font-medium">Fullscreen</span>
              </button>

              {/* More */}
              <button
                className="flex flex-col items-center gap-1 p-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all"
                title="More options"
              >
                <MoreVertical size={22} />
                <span className="text-xs font-medium">More</span>
              </button>

              {/* Divider */}
              <div className="w-px h-12 bg-gray-200 mx-2" />

              {/* End call */}
              <button
                onClick={handleEndCall}
                className="flex flex-col items-center gap-1 p-3 rounded-xl bg-red-500 hover:bg-red-600 text-white transition-all px-6"
                title="End call"
              >
                <PhoneOff size={22} />
                <span className="text-xs font-medium">End Call</span>
              </button>
            </div>
          )}
        </div>

        {/* ── Side Panel ── */}
        {(isChatOpen || isParticipants) && (
          <div className="w-80 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">

            {/* Chat Panel */}
            {isChatOpen && (
              <>
                <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="font-semibold text-gray-900">In-call Chat</h3>
                  <button onClick={() => setIsChatOpen(false)} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ maxHeight: '340px' }}>
                  {chatMessages.map(msg => (
                    <div key={msg.id} className={`flex flex-col ${msg.sender === 'You' ? 'items-end' : 'items-start'}`}>
                      <span className="text-xs text-gray-400 mb-1">{msg.sender} · {msg.time}</span>
                      <div className={`px-3 py-2 rounded-xl text-sm max-w-[90%] ${
                        msg.sender === 'You'
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t border-gray-100 flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <Button size="sm" onClick={handleSendMessage}>Send</Button>
                </div>
              </>
            )}

            {/* Participants Panel */}
            {isParticipants && (
              <>
                <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="font-semibold text-gray-900">Participants (2)</h3>
                  <button onClick={() => setIsParticipants(false)} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
                </div>
                <div className="p-4 space-y-3">
                  {[
                    { name: user?.name ?? 'You', role: user?.role ?? 'user', you: true },
                    { name: 'Sarah (Investor)', role: 'investor', you: false },
                  ].map((p, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                      <div className="w-9 h-9 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold text-sm">
                        {p.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{p.name} {p.you && <span className="text-xs text-gray-400">(You)</span>}</p>
                        <p className="text-xs text-gray-500 capitalize">{p.role}</p>
                      </div>
                      <div className="flex gap-1">
                        <span className="p-1 rounded bg-gray-100 text-gray-500"><Mic size={12} /></span>
                        <span className="p-1 rounded bg-gray-100 text-gray-500"><Video size={12} /></span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
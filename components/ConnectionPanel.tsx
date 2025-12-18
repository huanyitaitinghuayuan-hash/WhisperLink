import React, { useState } from 'react';
import { ConnectionStatus } from '../types';

interface ConnectionPanelProps {
  myId: string;
  status: ConnectionStatus;
  onConnect: (peerId: string) => void;
}

export const ConnectionPanel: React.FC<ConnectionPanelProps> = ({ myId, status, onConnect }) => {
  const [targetId, setTargetId] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(myId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConnect = () => {
    if (targetId.trim()) {
      onConnect(targetId.trim());
    }
  };

  return (
    <div className="flex flex-col h-full p-6 space-y-8 justify-center max-w-md mx-auto w-full">
      <div className="text-center space-y-2">
        <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl mx-auto flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">WhisperLink</h1>
        <p className="text-slate-400 text-sm">Secure, Local, Peer-to-Peer Chat</p>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Your Secure ID</label>
        <div className="flex items-center space-x-2">
          <code className="flex-1 bg-slate-900 p-3 rounded-xl text-indigo-300 font-mono text-sm break-all border border-slate-700">
            {myId || 'Generating ID...'}
          </code>
          <button 
            onClick={handleCopy}
            className="p-3 bg-slate-700 hover:bg-slate-600 rounded-xl transition-colors text-white"
          >
            {copied ? (
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
             </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-2">Share this ID with a friend to start chatting.</p>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Enter Friend's ID"
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>
        
        <button
          onClick={handleConnect}
          disabled={status === ConnectionStatus.CONNECTING || !targetId}
          className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform active:scale-95 ${
            status === ConnectionStatus.CONNECTING
              ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/25'
          }`}
        >
          {status === ConnectionStatus.CONNECTING ? 'Connecting...' : 'Start Secure Chat'}
        </button>
      </div>
    </div>
  );
};

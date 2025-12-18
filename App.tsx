import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Peer, DataConnection } from 'peerjs';
import { ConnectionPanel } from './components/ConnectionPanel';
import { ChatInterface } from './components/ChatInterface';
import { ConnectionStatus, Message } from './types';

// Helper to generate a random user-friendly ID suffix
const generateShortId = () => Math.floor(1000 + Math.random() * 9000).toString();

const App: React.FC = () => {
  const [myId, setMyId] = useState<string>('');
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(ConnectionStatus.DISCONNECTED);
  const [messages, setMessages] = useState<Message[]>([]);
  const [remotePeerId, setRemotePeerId] = useState<string>('');

  const peerRef = useRef<Peer | null>(null);
  const connRef = useRef<DataConnection | null>(null);

  // Initialize Peer
  useEffect(() => {
    // Dynamically import PeerJS to avoid SSR issues if this were a framework, 
    // though in a raw SPA it's fine. We use a random ID prefix for obscurity.
    const newPeer = new Peer(`user-${generateShortId()}-${Date.now().toString(36)}`, {
      debug: 1,
    });

    newPeer.on('open', (id) => {
      console.log('My Peer ID:', id);
      setMyId(id);
    });

    newPeer.on('connection', (conn) => {
      console.log('Incoming connection from:', conn.peer);
      
      if (connRef.current) {
        // Already connected, reject new or handle multi-chat (simplified: reject)
        conn.close();
        return;
      }

      handleConnectionSetup(conn);
    });

    newPeer.on('disconnected', () => {
        console.log("Peer disconnected from server");
        // PeerJS auto-reconnect logic could go here
    });

    newPeer.on('error', (err) => {
      console.error('Peer error:', err);
      // If ID is taken (rare with random) or network fails
      if (connectionStatus === ConnectionStatus.CONNECTING) {
        setConnectionStatus(ConnectionStatus.ERROR);
        setTimeout(() => setConnectionStatus(ConnectionStatus.DISCONNECTED), 3000);
      }
    });

    peerRef.current = newPeer;

    return () => {
      newPeer.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleConnectionSetup = (conn: DataConnection) => {
    connRef.current = conn;
    setRemotePeerId(conn.peer);
    setConnectionStatus(ConnectionStatus.CONNECTING);

    conn.on('open', () => {
      console.log('Connection established with:', conn.peer);
      setConnectionStatus(ConnectionStatus.CONNECTED);
    });

    conn.on('data', (data: any) => {
      // Expecting data to be a Message object
      const incomingMsg = data as Message;
      // Ensure it's marked as not self
      const msg: Message = { ...incomingMsg, isSelf: false };
      setMessages((prev) => [...prev, msg]);
    });

    conn.on('close', () => {
      console.log('Connection closed');
      handleDisconnect();
    });

    conn.on('error', (err) => {
      console.error('Connection error:', err);
      handleDisconnect();
    });
  };

  const connectToPeer = (peerId: string) => {
    if (!peerRef.current) return;
    setConnectionStatus(ConnectionStatus.CONNECTING);
    
    // Connect to the remote peer
    const conn = peerRef.current.connect(peerId);
    handleConnectionSetup(conn);
  };

  const handleDisconnect = useCallback(() => {
    if (connRef.current) {
      connRef.current.close();
    }
    connRef.current = null;
    setConnectionStatus(ConnectionStatus.DISCONNECTED);
    setRemotePeerId('');
    setMessages([]); // Optional: Clear chat on disconnect for security, or keep for history
  }, []);

  const sendMessage = (text: string) => {
    if (!connRef.current || connectionStatus !== ConnectionStatus.CONNECTED) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: myId,
      text: text,
      timestamp: Date.now(),
      isSelf: true
    };

    // Send the object directly. PeerJS handles serialization.
    connRef.current.send(newMessage);
    
    // Add to local state
    setMessages((prev) => [...prev, newMessage]);
  };

  return (
    <div className="h-full w-full bg-slate-950 flex flex-col items-center justify-center">
      {connectionStatus === ConnectionStatus.CONNECTED ? (
        <ChatInterface 
          messages={messages} 
          onSendMessage={sendMessage} 
          onDisconnect={handleDisconnect}
          remotePeerId={remotePeerId}
        />
      ) : (
        <ConnectionPanel 
          myId={myId} 
          status={connectionStatus} 
          onConnect={connectToPeer} 
        />
      )}
      
      {/* Error Toast */}
      {connectionStatus === ConnectionStatus.ERROR && (
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 bg-red-500/90 text-white px-6 py-3 rounded-full shadow-xl backdrop-blur-sm animate-bounce">
          Connection Failed. Check ID.
        </div>
      )}
    </div>
  );
};

export default App;

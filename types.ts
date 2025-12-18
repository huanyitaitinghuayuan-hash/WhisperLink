export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
  isSelf: boolean;
}

export enum ConnectionStatus {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  ERROR = 'ERROR'
}

export interface UserProfile {
  id: string;
  username: string;
}

// Minimal definition for PeerJS since we don't have the types package installed in this environment
export interface PeerError extends Error {
  type: string;
}

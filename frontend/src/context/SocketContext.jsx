import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('erp_token');

    if (!isAuthenticated || !token) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // On Vercel serverless, WebSockets are disabled unless a dedicated WS server is provided
    const isVercel = window.location.hostname.endsWith('vercel.app');
    const wsUrl = import.meta.env.VITE_WS_URL;

    if (isVercel && !wsUrl) {
      console.log('[Socket] Serverless deployment detected. Real-time WebSockets polling disabled to maximize speed.');
      return;
    }

    const backendEnvUrl = import.meta.env.VITE_BACKEND_URL;
    const targetUrl =
      wsUrl ||
      backendEnvUrl ||
      (window.location.port === '5173'
        ? 'http://localhost:3000'
        : window.location.origin);

    console.log(`[Socket] Initializing connection to ${targetUrl}...`);

    const newSocket = io(targetUrl, {
      auth: { token },
      transports: ['websocket'],
      reconnectionAttempts: 3,
      reconnectionDelay: 5000,
      timeout: 5000,
    });

    newSocket.on('connect', () => {
      console.log(`[Socket] Connected to real-time WebSockets (Socket ID: ${newSocket.id})`);
      setIsConnected(true);
    });

    newSocket.on('disconnect', (reason) => {
      console.log(`[Socket] Disconnected from WebSockets: ${reason}`);
      setIsConnected(false);
    });

    newSocket.on('connect_error', (err) => {
      console.warn(`[Socket] Connection error: ${err.message}`);
      setIsConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [isAuthenticated, user?.id]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  return context || { socket: null, isConnected: false };
}

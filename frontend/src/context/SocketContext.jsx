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

    // Determine target URL for WebSocket server
    const backendEnvUrl = import.meta.env.VITE_BACKEND_URL
      ? import.meta.env.VITE_BACKEND_URL.replace(/\/+$/, '')
      : null;

    const targetUrl =
      backendEnvUrl ||
      (window.location.port === '5173'
        ? 'http://localhost:3000'
        : window.location.origin);

    console.log(`[Socket] Initializing connection to ${targetUrl} with JWT authentication...`);

    const newSocket = io(targetUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
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

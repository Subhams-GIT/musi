
'use client'
import React, { createContext, useRef, useEffect } from 'react';

export const WebSocketContext = createContext<React.RefObject<WebSocket|null> | null>(null);

export const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
  const ws = useRef<WebSocket|null>(null);

  useEffect(() => {
    ws.current = new WebSocket('ws://localhost:8080');

    ws.current.onopen = () => {
      console.log("WebSocket connected");
    };

    ws.current.onclose = () => {
      console.log("WebSocket closed");
    };

    return () => {
      ws.current?.close();
    };
  }, []);

  return (
    <WebSocketContext.Provider value={ws}>
      {children}
    </WebSocketContext.Provider>
  );
};

'use client';
import React, { createContext, useRef, useEffect, useCallback } from 'react';

type WebSocketContextType = {
  ws: React.RefObject<WebSocket | null>;
  sendMessage:(msg:string)=>void;
};

export const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    
    if(ws.current && ws.current.readyState==WebSocket.OPEN){
      console.log('connection already present');
      return ;
    }
    
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
    }

    const socket = new WebSocket('ws://localhost:8080');
    ws.current = socket;

    socket.onopen = () => {
      console.log('%c WebSocket connected', 'color: green');
    };


    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    socket.onclose = () => {
      ws.current?.close();
      // ws.current!.onmessage=null;
      ws.current=null;
      reconnectTimeout.current = setTimeout(connect, 3000);
    };
  }, []);

  const sendMessage = (msg: string) => {
    if ( ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(msg);
    } else {
      console.warn('WebSocket not connected');
    }
  };

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
    };
  }, [connect]);


  return (
    <WebSocketContext.Provider value={{ws,sendMessage}}>
      {children}
    </WebSocketContext.Provider>
  );
};

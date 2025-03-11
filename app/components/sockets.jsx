'use client';

import { useEffect } from 'react';
import io from 'socket.io-client';

export default function Sockets() {
  useEffect(() => {
    const socket = io();

    socket.on('connect', () => {
      console.log('Connected to server');
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold">WebSocket Test</h1>
    </main>
  );
}
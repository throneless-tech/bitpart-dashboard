'use client';

import { useCallback, useEffect, useState } from 'react';
import { useWebSocket } from './useWebSocket';

export function useMessaging(url) {
  const socket = useWebSocket(url);

  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const controller = new AbortController();

    socket?.addEventListener(
      'message',
      async (event) => {
        const payload =
          typeof event.data === 'string' ? event.data : await event.data.text();
        const message = JSON.parse(payload);
        console.log('Incoming message:', message);
        setMessages((p) => [...p, message]);
      },
      controller,
    );

    socket?.addEventListener(
      'error',
      () => {
        const content = 'An error occurred while connecting to the server';
        setMessages((p) => [...p, { author: 'System', content }]);
      },
      controller,
    );

    socket?.addEventListener(
      'close',
      (event) => {
        if (event.wasClean) return;
        const content = 'The connection to the server was closed unexpectedly';
        setMessages((p) => [...p, { author: 'System', content }]);
      },
      controller,
    );

    return () => controller.abort();
  }, [socket]);

  const sendMessage = useCallback(
    (message) => {
      if (!socket || socket.readyState !== socket.OPEN) return;
      console.log('Outgoing message:', message);
      socket.send(JSON.stringify(message));
      setMessages((p) => [...p, { ...message, author: 'You' }]);
    },
    [socket],
  );

  return [messages, sendMessage];
}
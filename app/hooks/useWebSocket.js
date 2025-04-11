import { useEffect, useState } from 'react';

const useWebSocket = (url) => {
  const [messages, setMessages] = useState([]);
  const [ws, setWs] = useState(null);

  useEffect(() => {
    const socket = new WebSocket(url);
    setWs(socket);

    socket.onmessage = (event) => {
      setMessages((prevMessages) => [...prevMessages, event.data]);
    };

    return () => {
      socket.close();
    };
  }, [url]);

  const sendMessage = (message) => {
    if (ws) {
      ws.send(message);
    }
  };

  return { messages, sendMessage };
};

export default useWebSocket;
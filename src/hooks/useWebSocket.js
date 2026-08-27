import { useEffect, useRef } from 'react';
import socket from '../config/socket';

/**
 * Custom hook to manage WebSocket subscriptions with stable callback reference
 * @param {string} eventName - The name of the event to listen for
 * @param {function} callback - The callback to execute when the event is received
 */
export const useWebSocket = (eventName, callback) => {
  const savedCallback = useRef(callback);

  // Keep latest callback reference without triggering re-subscriptions
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!eventName) return;

    // Connect to WebSocket server once
    socket.connect();

    const handleEvent = (data) => {
      if (typeof savedCallback.current === 'function') {
        savedCallback.current(data);
      }
    };

    socket.on(eventName, handleEvent);

    return () => {
      socket.off(eventName, handleEvent);
    };
  }, [eventName]);
};

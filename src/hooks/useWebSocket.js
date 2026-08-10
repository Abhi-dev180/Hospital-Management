import { useEffect, useCallback } from 'react';
import socket from '../config/socket';

/**
 * Custom hook to manage WebSocket subscriptions
 * @param {string} eventName - The name of the event to listen for
 * @param {function} callback - The callback to execute when the event is received
 */
export const useWebSocket = (eventName, callback) => {
  useEffect(() => {
    if (!eventName || !callback) return;

    // Connect to WebSocket server
    socket.connect();

    // The callback provided is executed whenever the eventName is triggered
    const handleEvent = (data) => {
      callback(data);
    };

    socket.on(eventName, handleEvent);

    return () => {
      socket.off(eventName, handleEvent);
    };
  }, [eventName, callback]);
};

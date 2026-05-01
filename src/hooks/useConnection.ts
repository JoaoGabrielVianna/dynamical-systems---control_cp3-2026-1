import { useState, useCallback } from "react";

export type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error";

export const useConnection = () => {
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const [port, setPort] = useState<string | null>(null);

  const connect = useCallback((selectedPort: string, opts?: { failChance?: number }) => {
    setStatus("connecting");
    setPort(selectedPort);
    return new Promise<boolean>(resolve => {
      setTimeout(() => {
        const fail = Math.random() < (opts?.failChance ?? 0);
        if (fail) {
          setStatus("error");
          resolve(false);
        } else {
          setStatus("connected");
          resolve(true);
        }
      }, 1400);
    });
  }, []);

  const disconnect = useCallback(() => {
    setStatus("disconnected");
    setPort(null);
  }, []);

  const reset = useCallback(() => setStatus("disconnected"), []);

  return { status, port, connect, disconnect, reset };
};

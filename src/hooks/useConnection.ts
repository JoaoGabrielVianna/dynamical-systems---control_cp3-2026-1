import { useState, useCallback, useRef } from "react";

export type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error";

export interface ConnectionHandlers {
  onData?: (line: string) => void;
  onDisconnect?: () => void;
}

export const useConnection = (handlers?: ConnectionHandlers) => {
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const [port, setPort] = useState<string | null>(null);

  const serialPortRef = useRef<SerialPort | null>(null);
  const readerRef = useRef<ReadableStreamDefaultReader | null>(null);
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  const startReadLoop = useCallback(async (sp: SerialPort) => {
    const decoder = new TextDecoderStream();
    sp.readable!.pipeTo(decoder.writable).catch(() => {
      setStatus("disconnected");
      setPort(null);
      handlersRef.current?.onDisconnect?.();
    });

    const reader = decoder.readable.getReader();
    readerRef.current = reader;

    let buffer = "";
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += value;
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed) handlersRef.current?.onData?.(trimmed);
        }
      }
    } catch {
      // porta fechada
    }
  }, []);

  const connect = useCallback(async () => {
    if (!("serial" in navigator)) {
      setStatus("error");
      return false;
    }
    setStatus("connecting");
    try {
      const sp = await navigator.serial.requestPort({});
      await sp.open({ baudRate: 9600 });
      serialPortRef.current = sp;

      const info = sp.getInfo();
      const portLabel =
        (info as any).usbVendorId
          ? `USB 0x${((info as any).usbVendorId as number).toString(16).padStart(4, "0")}`
          : "Serial Device";

      setPort(portLabel);
      setStatus("connected");
      startReadLoop(sp);
      return true;
    } catch (err: any) {
      if (err?.name === "NotFoundError") {
        setStatus("disconnected");
      } else {
        setStatus("error");
      }
      return false;
    }
  }, [startReadLoop]);

  const sendCommand = useCallback(async (value: string) => {
    const sp = serialPortRef.current;
    if (!sp || !sp.writable) return;
    const writer = sp.writable.getWriter();
    try {
      await writer.write(new TextEncoder().encode(`${value}\n`));
    } finally {
      writer.releaseLock();
    }
  }, []);

  const disconnect = useCallback(async () => {
    try { await readerRef.current?.cancel(); } catch { /* ok */ }
    try { await serialPortRef.current?.close(); } catch { /* ok */ }
    readerRef.current = null;
    serialPortRef.current = null;
    setStatus("disconnected");
    setPort(null);
  }, []);

  return { status, port, connect, disconnect, sendCommand };
};

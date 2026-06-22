type ChatEventListener = (data: ChatEvent) => void;

export interface ChatEvent {
  type: "message";
  roomId: number;
  message: {
    id: number;
    roomId: number;
    userName: string;
    content: string;
    isAi: number;
    createdAt: string;
  };
}

class ChatEventBus {
  private listeners = new Map<number, Set<ChatEventListener>>();

  subscribe(roomId: number, listener: ChatEventListener): () => void {
    if (!this.listeners.has(roomId)) {
      this.listeners.set(roomId, new Set());
    }
    this.listeners.get(roomId)!.add(listener);

    return () => {
      this.listeners.get(roomId)?.delete(listener);
      if (this.listeners.get(roomId)?.size === 0) {
        this.listeners.delete(roomId);
      }
    };
  }

  publish(event: ChatEvent): void {
    const roomListeners = this.listeners.get(event.roomId);
    if (roomListeners) {
      for (const listener of roomListeners) {
        listener(event);
      }
    }
  }
}

export const chatEventBus = new ChatEventBus();

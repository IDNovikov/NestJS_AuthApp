export interface WebSocketPort {
  emitToDesk(deskId: number, event: string, payload: unknown): void;
}

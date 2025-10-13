export type NotifyPayload = {
  placeId: number; // название места (БДТ, Лахта ...)
  eventId: number; // название события (спектакль ...)
  slotId: number; // дата и время
  sectionLabel: string; // какие места (Партер/Ряд12)
  quantity: number;
  startsAt: Date; // А нужно ли?
};

export interface NotificationsPort {
  notify(payload: NotifyPayload): Promise<void>;
}

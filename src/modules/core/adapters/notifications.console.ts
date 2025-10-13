import { Injectable } from '@nestjs/common';
import { NotificationsPort, NotifyPayload } from '../ports/notifications.port';

@Injectable()
export class ConsoleNotifications implements NotificationsPort {
  async notify(p: NotifyPayload): Promise<void> {
    // пока просто лог; позже — Telegram/email/BullMQ
    console.log(
      `🔔 [notify] event=${p.eventId} slot=${p.slotId} "${p.sectionLabel}" qty=${p.quantity} at=${p.startsAt.toISOString()}`,
    );
  }
}

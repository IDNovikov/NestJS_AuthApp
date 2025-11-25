import { DesksEntity } from '../types/desks.entity';

export interface DesksEventsPort {
  deskUpdated(desk: DesksEntity): void;
  deskDeleted(id: number): void;
}

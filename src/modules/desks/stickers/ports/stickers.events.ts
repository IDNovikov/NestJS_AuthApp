import { StickerEntity } from '../types/sticker.entity';

export interface StickersEventsPort {
  stickerCreated(sticker: StickerEntity): void;
  stickerUpdated(sticker: StickerEntity): void;
  stickerDeleted(sticker: StickerEntity): void;
}

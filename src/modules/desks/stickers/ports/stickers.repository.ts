import { CreateStickerDto } from '../dto/create-sticker.dto';
import { UpdateStickerDto } from '../dto/update-sticker.dto';
import { StickerEntity } from '../types/sticker.entity';

export interface StickersRepository {
  create(dto: CreateStickerDto): Promise<StickerEntity>;
  findAllByBoardId(boardId: number): Promise<null>;
  update(dto: UpdateStickerDto): Promise<StickerEntity>;
  delete(id: number): Promise<void>;
}

import { CreateDeskDto } from '../dto/create-desk.dto';
import { UpdateDeskDto } from '../dto/update-desk.dto';
import { DesksEntity } from '../types/desks.entity';

export interface DesksRepository {
  create(dto: CreateDeskDto): Promise<DesksEntity>;
  findByUserId(id: number): Promise<DesksEntity | null>;
  findById(id: number): Promise<DesksEntity | null>;
  update(dto: UpdateDeskDto): Promise<DesksEntity>;
  delete(id: number): Promise<void>;
}

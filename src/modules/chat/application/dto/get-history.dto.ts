// src/modules/chat/application/dto/get-history.dto.ts

export class GetHistoryDto {
  chatId!: string;
  limit: number = 50;
  offset: number = 0;
}

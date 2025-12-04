export class GetMessagesDto {
  chatId: number;
  userId: number;
  limit?: number;
  cursor?: string;
}

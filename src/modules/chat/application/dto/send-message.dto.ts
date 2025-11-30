// DTO, который прилетает с REST/WebSocket
export class SendMessageDto {
  chatId!: string;
  text!: string;
  // authorId можно брать из JWT, а можно передавать — зависит от архитектуры
}

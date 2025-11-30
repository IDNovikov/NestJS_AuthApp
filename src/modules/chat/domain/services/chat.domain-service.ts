import { ChatRepository } from '../ports/chat.repository';
import { ChatEventsPort } from '../ports/chat-events.port';
import { ChatMessage } from '../entities/chat-message.entity';
import { MessageSentEvent } from '../events/message-sent.event';
import { MessageEditedEvent } from '../events/message-edited.event';
import { Injectable } from '@nestjs/common';
import { Chat } from '../entities/chat.entity';

@Injectable()
export class ChatDomainService {
  constructor(
    private readonly chatRepo: ChatRepository,
    private readonly events: ChatEventsPort,
  ) {}

  async getChatsByUserId(
    userId: number,
    lastMessagesLimit = 20,
  ): Promise<Chat[]> {
    const chats = await this.chatRepo.getChatsByUserId(
      userId,
      lastMessagesLimit,
    );

    return chats.filter((chat) => chat.hasUser(userId));
  }

  async sendMessage(params) {
    const room = await this.chatRepo.findRoomById(params.chatId);
    if (!room) {
      throw new Error('Chat not found');
    }

    if (!room.hasUser(params.authorId)) {
      throw new Error('User not in chat');
    }

    // const message = ChatMessage.createNew(...params);

    // await this.chatRepo.saveMessage(message);

    // // Домашнее правило: после сохранения генерим доменное событие
    // const event = new MessageSentEvent(message);
    // await this.events.publishMessageSent(event);

    // return message;

    // Домашнее правило: после с
    // охранения генерим доменное событие
    //const event = new MessageSentEvent(message);
    //await this.events.publishMessageSent(event);
    //return message;
  }

  async checkRoom() {}
  async createMessage() {}
  async getMessages() {}

  async editMessage() {}

  async saveMessage() {}

  async findMessage() {}

  async deleteMessage() {}
}

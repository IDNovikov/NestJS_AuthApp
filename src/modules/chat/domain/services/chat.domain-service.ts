import { ChatRepository } from '../ports/chat.repository';
import { ChatEventsPort } from '../ports/chat-events.port';
import { ChatMessage } from '../entities/chat-message.entity';
import { MessageSentEvent } from '../events/message-sent.event';
import { Injectable } from '@nestjs/common';
import { Chat } from '../entities/chat.entity';
import { SendMessageDto } from '../../application/dto/send-message.dto';
import { EditMessageDto } from '../../application/dto/edit-message.dto';
import { ChatRoom } from '../entities/chat-room.entity';
import { ChatUser } from '../entities/chat-user.entity';
import { ChatUserDTO } from '../../application/dto/chat-user.dto';

@Injectable()
export class ChatDomainService {
  constructor(
    private readonly chatRepo: ChatRepository,
    private readonly events: ChatEventsPort,
  ) {}

  //Chats
  async getChatsByUserId(
    userId: number,
    limit = 20,
    cursor: number,
  ): Promise<Chat[]> {
    const chats = await this.chatRepo.getChatsByUserId(userId, limit);
    return chats.filter((chat) => chat.hasUser(userId));
  }

  async createChat(
    users: ChatUserDTO[],
    title: string | null,
  ): Promise<ChatRoom> {
    const chatEntity = ChatRoom.createNew(
      users.map((m) => ChatUser.createNew(m.id, m.userName, m.userImage)),
      title,
    );
    if (chatEntity.members.length == 2) {
      const oldChat = await this.chatRepo.isPrivateChatExist(
        chatEntity.members,
      );
      if (oldChat) throw new Error('Private chat is already exist');
    }
    const newChat = await this.chatRepo.createChatRoom(chatEntity);
    return newChat;
  }

  async editeMembersInChat(
    chatId: number,
    users: ChatUserDTO[],
  ): Promise<ChatRoom> {
    const existingRoom = await this.isChatExist(chatId);
    const isUserIn = users.find((u) => existingRoom.hasUser(u.id));
    if (!isUserIn) throw new Error('No users in this chat');

    const members = users.map((user) =>
      ChatUser.createNew(user.id, user.userName, user.userImage),
    );
    const newChat = await this.chatRepo.editMembersInChat(chatId, members);
    return newChat;
  }

  async isChatExist(chatId: number): Promise<ChatRoom> {
    const chatRoom = await this.chatRepo.findRoomById(chatId);
    if (!chatRoom) {
      throw new Error('Chat not found');
    }
    return chatRoom;
  }

  isUserMember(userId: number, chat: ChatRoom): boolean {
    return chat.hasUser(userId);
  }

  async isPrivateChatExist(members: ChatUser[]) {}

  //Messages
  async sendDomainMessage(
    userId: number,
    dto: SendMessageDto,
  ): Promise<ChatMessage> {
    let chatRoom = await this.isChatExist(dto.chatId);

    if (!this.isUserMember(userId, chatRoom))
      throw new Error('User is not member');

    const message = ChatMessage.createNew(dto.chatId, userId, dto.text);
    const sendedMessage = await this.chatRepo.createMessage(message);
    if (!sendedMessage) throw new Error('Message is not saved');

    const event = new MessageSentEvent(message);
    await this.events.publishMessageSent(event);
    return sendedMessage;
  }

  async editDomainMessage(
    userId: number,
    dto: EditMessageDto,
  ): Promise<ChatMessage> {
    const message = await this.chatRepo.getMessageById(dto.messageId);
    if (!message) throw new Error('Message not found');
    if (!message.isAuthor(userId)) throw new Error('User is not author');
    message.edit(dto.newText);
    const editedMessage = await this.chatRepo.editMessage(message);
    if (!editedMessage) throw new Error('Message not saved');
    const event = new MessageSentEvent(editedMessage);
    await this.events.publishMessageEdited(event);
    return editedMessage;
  }

  async getMessages(
    userId: number,
    chatId: number,
    limit: number,
    cursor?: string,
  ): Promise<{ messages: ChatMessage[]; nextCursor?: string }> {
    const chat = await this.isChatExist(chatId);
    if (!chat.hasUser(userId)) throw new Error('No roots');
    const { messages, nextCursor } = await this.chatRepo.getMessagesByChatId(
      chatId,
      limit,
      cursor,
    );
    return { messages, nextCursor };
  }
}

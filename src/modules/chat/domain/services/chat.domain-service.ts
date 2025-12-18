import { ChatRepository } from '../ports/chat.repository';
import { ChatMessage } from '../entities/chat-message.entity';
import { MessageSentEvent } from '../events/message-sent.event';
import { Injectable } from '@nestjs/common';
import { SendMessageDto } from '../../application/dto/send-message.dto';
import { EditMessageDto } from '../../application/dto/edit-message.dto';
import { ChatRoom } from '../entities/chat-room.entity';
import { ChatUser } from '../entities/chat-user.entity';
import { ChatUserDTO } from '../../application/dto/chat-user.dto';
import { ChatRoomDTO } from '../../application/dto/chat-room.dto';
import { MessageEditedEvent } from '../events/message-edited.event';
import { ChatEventsPort } from '../events/ws.port';

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
    cursor?: number,
  ): Promise<ChatRoom[]> {
    const chats = await this.chatRepo.getUsersChats(userId, limit, cursor);
    return chats.filter((chat) => chat.hasUser(userId));
  }

  async createChat(
    users: ChatUserDTO[],
    name: string | null,
  ): Promise<ChatRoom> {
    if (users.length <= 1) {
      throw new Error('No single users chats');
    }
    const chatEntity = ChatRoom.createNew(
      users.map((m) => ChatUser.createNew(m.id, m.userName, m.userImage)),
      name,
    );

    if (chatEntity.members.length == 2) {
      const oldChat = await this.chatRepo.isPrivateChatExist(
        chatEntity.members[0].id,
        chatEntity.members[1].id,
      );

      if (oldChat) throw new Error('Private chat is already exist');
    }
    const newChat = await this.chatRepo.createChatRoom(chatEntity);
    return newChat;
  }

  async updateChatData(updatedData: ChatRoomDTO): Promise<ChatRoom> {
    const chat = await this.isChatExist(updatedData.id);
    if (updatedData.name) {
      chat.editName(updatedData.name);
    }
    const isUserIn = updatedData.members.find((u) => chat.hasUser(u.id));
    if (!isUserIn) throw new Error('No users in this chat');
    if (updatedData.name) {
      chat.editName(updatedData.name);
    }
    if (updatedData.members) {
      const newMembers = updatedData.members.map((m) =>
        ChatUser.createNew(m.id, m.userName, m.userImage),
      );
      chat.updateMembers(newMembers);
    }
    const updatedChat = await this.chatRepo.updateChatRoom(chat);
    return updatedChat;
  }

  async isChatExist(chatId: number): Promise<ChatRoom> {
    const chatRoom = await this.chatRepo.getChatById(chatId);
    if (!chatRoom) {
      throw new Error('Chat not found');
    }
    return chatRoom;
  }

  //Messages
  async sendDomainMessage(
    userId: number,
    dto: SendMessageDto,
  ): Promise<ChatMessage> {
    let chatRoom = await this.isChatExist(dto.chatId);

    if (!chatRoom.hasUser(userId)) throw new Error('User is not member');

    const message = ChatMessage.createNew(dto.chatId, userId, dto.text);
    const sendedMessage = await this.chatRepo.createMessage(message);
    if (!sendedMessage) throw new Error('Message is not saved');
    console.log(sendedMessage);
    const event = new MessageSentEvent(message);
    console.log(event);
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
    const event = new MessageEditedEvent(editedMessage);
    await this.events.publishMessageEdited(event);
    return editedMessage;
  }

  async getMessages(
    userId: number,
    chatId: number,
    limit?: number,
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
